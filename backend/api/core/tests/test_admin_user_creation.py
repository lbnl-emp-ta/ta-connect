import pytest
import tablib
from allauth.socialaccount.models import SocialAccount, SocialLogin
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import Client, RequestFactory, override_settings
from django.urls import reverse

from api.settings import parse_csv_emails
from core.adapters import CustomAccountAdapter, CustomSocialAccountAdapter
from core.admin import UserResource

User = get_user_model()


class TestParseCsvEmails:
    def test_empty_or_none_returns_empty_set(self):
        assert parse_csv_emails(None) == set()
        assert parse_csv_emails("") == set()
        assert parse_csv_emails(" , , ") == set()

    def test_normalizes_case_and_whitespace(self):
        result = parse_csv_emails(" Alice@LBL.gov , bob@example.org, ")
        assert result == {"alice@lbl.gov", "bob@example.org"}


@pytest.mark.django_db
class TestAdminUserAllowlist:
    @pytest.fixture
    def superuser_client(self):
        admin_user = User.objects.create_superuser(
            email="superadmin@example.com",
            password="SuperSecretPassword123!",
        )
        client = Client()
        client.force_login(admin_user)
        return client

    @override_settings(APPROVED_ADMIN_EMAILS=set())
    def test_admin_add_user_blocked_when_allowlist_empty(self, superuser_client):
        url = reverse("admin:core_user_add")
        response = superuser_client.post(
            url,
            data={
                "email": "anyone@lbl.gov",
                "name": "Anyone",
                "phone": "",
                "usable_password": "true",
                "password1": "ValidPass123!@#",
                "password2": "ValidPass123!@#",
            },
        )
        assert response.status_code == 200
        assert not User.objects.filter(email="anyone@lbl.gov").exists()
        assert "email" in response.context["adminform"].form.errors

    @override_settings(APPROVED_ADMIN_EMAILS={"approved@lbl.gov"})
    def test_admin_add_user_rejects_unapproved_email(self, superuser_client):
        url = reverse("admin:core_user_add")
        response = superuser_client.post(
            url,
            data={
                "email": "notapproved@lbl.gov",
                "name": "Unapproved User",
                "phone": "",
                "usable_password": "true",
                "password1": "ValidPass123!@#",
                "password2": "ValidPass123!@#",
            },
        )
        assert response.status_code == 200
        assert not User.objects.filter(email="notapproved@lbl.gov").exists()
        assert "email" in response.context["adminform"].form.errors

    @override_settings(APPROVED_ADMIN_EMAILS={"approved@lbl.gov"})
    def test_admin_add_user_allows_approved_email_case_insensitive_and_hashes_password(
        self, superuser_client
    ):
        url = reverse("admin:core_user_add")
        response = superuser_client.post(
            url,
            data={
                "email": "Approved@LBL.gov",
                "name": "Approved User",
                "phone": "555-0100",
                "usable_password": "true",
                "password1": "ValidPass123!@#",
                "password2": "ValidPass123!@#",
            },
        )
        assert response.status_code == 302
        created = User.objects.get(email__iexact="approved@lbl.gov")
        assert created.check_password("ValidPass123!@#")
        assert created.name == "Approved User"

    @override_settings(APPROVED_ADMIN_EMAILS={"approved-new@lbl.gov"})
    def test_admin_edit_non_orcid_user_allows_unchanged_email_but_blocks_unapproved_email_change(
        self, superuser_client
    ):
        local_user = User.objects.create_user(
            email="bootstrapped@example.com",
            password="ValidPass123!@#",
            name="Initial Name",
        )
        change_url = reverse("admin:core_user_change", args=[local_user.pk])

        # Updating non-email fields while keeping existing email succeeds
        response_same_email = superuser_client.post(
            change_url,
            data={
                "email": "bootstrapped@example.com",
                "name": "Updated Name",
                "phone": "",
                "is_active": "on",
            },
        )
        assert response_same_email.status_code == 302
        local_user.refresh_from_db()
        assert local_user.name == "Updated Name"

        # Changing email to an unapproved address is rejected
        response_bad_email = superuser_client.post(
            change_url,
            data={
                "email": "unapproved-change@example.com",
                "name": "Updated Name",
                "phone": "",
                "is_active": "on",
            },
        )
        assert response_bad_email.status_code == 200
        assert "email" in response_bad_email.context["adminform"].form.errors
        local_user.refresh_from_db()
        assert local_user.email == "bootstrapped@example.com"

        # Changing email to an approved address succeeds
        response_good_email = superuser_client.post(
            change_url,
            data={
                "email": "approved-new@lbl.gov",
                "name": "Updated Name",
                "phone": "",
                "is_active": "on",
            },
        )
        assert response_good_email.status_code == 302
        local_user.refresh_from_db()
        assert local_user.email == "approved-new@lbl.gov"

    @override_settings(APPROVED_ADMIN_EMAILS=set())
    def test_admin_edit_orcid_user_email_is_unrestricted(self, superuser_client):
        orcid_user = User.objects.create_user(
            email="0000-0001-2345-6789@orcid.placeholder",
            password=None,
            name="ORCID Researcher",
        )
        SocialAccount.objects.create(
            user=orcid_user,
            provider="orcid",
            uid="0000-0001-2345-6789",
        )

        change_url = reverse("admin:core_user_change", args=[orcid_user.pk])
        response = superuser_client.post(
            change_url,
            data={
                "email": "researcher@university.edu",
                "name": "ORCID Researcher",
                "phone": "",
                "is_active": "on",
            },
        )
        assert response.status_code == 302
        orcid_user.refresh_from_db()
        assert orcid_user.email == "researcher@university.edu"


@pytest.mark.django_db
class TestUserResourceImportAllowlist:
    @override_settings(APPROVED_ADMIN_EMAILS={"import-ok@lbl.gov"})
    def test_import_new_user_enforces_allowlist(self):
        resource = UserResource()

        bad_dataset = tablib.Dataset(
            ["", "import-blocked@lbl.gov", "Blocked Import"],
            headers=["id", "email", "name"],
        )
        bad_result = resource.import_data(bad_dataset, dry_run=False)
        assert bad_result.has_validation_errors()
        assert not User.objects.filter(email="import-blocked@lbl.gov").exists()

        # Explicit non-existent ID also cannot bypass the allowlist
        explicit_id_dataset = tablib.Dataset(
            ["99999", "import-blocked-id@lbl.gov", "Blocked Explicit ID"],
            headers=["id", "email", "name"],
        )
        explicit_id_result = resource.import_data(explicit_id_dataset, dry_run=False)
        assert explicit_id_result.has_validation_errors()
        assert not User.objects.filter(email="import-blocked-id@lbl.gov").exists()

        good_dataset = tablib.Dataset(
            ["", "import-ok@lbl.gov", "Allowed Import"],
            headers=["id", "email", "name"],
        )
        good_result = resource.import_data(good_dataset, dry_run=False)
        assert not good_result.has_errors()
        assert not good_result.has_validation_errors()
        imported_user = User.objects.get(email="import-ok@lbl.gov")
        assert not imported_user.has_usable_password()

    @override_settings(APPROVED_ADMIN_EMAILS={"approved-update@lbl.gov"})
    def test_import_existing_user_email_rules(self):
        resource = UserResource()

        non_orcid = User.objects.create_user(
            email="existing-local@example.com",
            password="ValidPass123!@#",
            name="Old Name",
        )
        orcid_user = User.objects.create_user(
            email="orcid-init@example.com",
            password=None,
            name="ORCID User",
        )
        SocialAccount.objects.create(
            user=orcid_user,
            provider="orcid",
            uid="0000-0002-0000-1111",
        )

        # Non-ORCID: updating name with same email succeeds
        same_email_ds = tablib.Dataset(
            [str(non_orcid.pk), "existing-local@example.com", "New Name"],
            headers=["id", "email", "name"],
        )
        res1 = resource.import_data(same_email_ds, dry_run=False)
        assert not res1.has_validation_errors()
        non_orcid.refresh_from_db()
        assert non_orcid.name == "New Name"

        # Non-ORCID: changing email to unapproved fails
        bad_email_ds = tablib.Dataset(
            [str(non_orcid.pk), "unapproved@example.com", "New Name"],
            headers=["id", "email", "name"],
        )
        res2 = resource.import_data(bad_email_ds, dry_run=False)
        assert res2.has_validation_errors()
        non_orcid.refresh_from_db()
        assert non_orcid.email == "existing-local@example.com"

        # ORCID user: changing email to unapproved succeeds
        orcid_ds = tablib.Dataset(
            [str(orcid_user.pk), "any-orcid-email@university.edu", "ORCID User"],
            headers=["id", "email", "name"],
        )
        res3 = resource.import_data(orcid_ds, dry_run=False)
        assert not res3.has_validation_errors()
        orcid_user.refresh_from_db()
        assert orcid_user.email == "any-orcid-email@university.edu"


@pytest.mark.django_db
class TestSignupAdaptersAndCli:
    def test_headless_direct_signup_is_disabled(self):
        client = Client()
        response = client.post(
            "/_allauth/browser/v1/auth/signup",
            data={
                "email": "bypass@example.com",
                "password": "ValidPass123!@#",
            },
            content_type="application/json",
        )
        assert response.status_code == 403
        assert not User.objects.filter(email="bypass@example.com").exists()

    def test_adapters_allow_only_orcid_signup(self):
        request = RequestFactory().get("/")
        assert CustomAccountAdapter().is_open_for_signup(request) is False

        orcid_login = SocialLogin(account=SocialAccount(provider="orcid", uid="1234"))
        other_login = SocialLogin(account=SocialAccount(provider="google", uid="1234"))
        social_adapter = CustomSocialAccountAdapter()

        assert social_adapter.is_open_for_signup(request, orcid_login) is True
        assert social_adapter.is_open_for_signup(request, other_login) is False

    @override_settings(APPROVED_ADMIN_EMAILS=set())
    def test_createsuperuser_cli_remains_unrestricted(self, monkeypatch):
        monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "CliSuperPass123!")
        call_command(
            "createsuperuser",
            interactive=False,
            email="cli-bootstrap@example.com",
        )
        assert User.objects.filter(
            email="cli-bootstrap@example.com", is_superuser=True
        ).exists()
