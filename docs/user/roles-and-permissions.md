# Roles and Permissions

Your roles determine which requests you can see and which actions TA Connect displays. A user can hold more than one role.

## Roles

### Admin

Admins maintain TA Connect across programs and laboratories. They can use **Admin Mode** for system-wide request and expert visibility, perform any workflow assignment, edit request data, manage role assignments, delete customer and organization records, and complete closeout actions.

Administrator access is intentionally inactive until **Admin Mode** is turned on. The switch appears on the Requests and Experts pages.

### Coordinator

Coordinators manage incoming requests at reception. They scope requests, update intake and scope information, assign requests to programs, and cancel or reopen requests. Coordinators have system-wide reception visibility.

### Program Lead

Program Leads are the points of contact for a program. They review requests assigned to that program, refine scope information, assign requests to laboratories or directly to Experts when available, and perform the final closeout review. They can return a request to reception or cancel and reopen applicable requests.

### Lab Lead

Lab Leads are laboratory points of contact for a specific program. They review requests assigned to their laboratory, update depth and topics, assign requests to Experts, and perform the laboratory closeout review. They can return a request to the program. Note that a Lab Lead role is specific to the lab-program combination. If you are a Lab Lead for the same lab in 2 separate programs, you will have two separate roles in TA Connect.

### Expert

Experts provide technical assistance. They can work with requests assigned directly to them, enter project dates, add notes and attachments, complete the closeout form, and return an assignment to the laboratory when needed. Note that an Expert role is specific to the lab-program combination. If you are an Expert for the same lab in 2 separate programs, you will have two separate roles in TA Connect.

## Permission summary

The table below shows each action and if/when each role has permission to perform it. **Always** means the action is available regardless of request status, subject to the role's normal request visibility. **When assigned** means that the request must be assigned within that user's program, laboratory, or Expert role. If a status is listed, this means that the role can perform that action only when the request has that status. A dash means the role does not have permission to perform the action.

| Action                         | Admin                            | Coordinator                      | Program Lead                             | Lab Lead                                 | Expert                                   |
| ------------------------------ | -------------------------------- | -------------------------------- | ---------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Edit description               | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | —                                        | —                                        |
| Edit challenges                | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | —                                        | —                                        |
| Edit goals                     | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | —                                        | —                                        |
| Edit effort                    | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | —                                        | —                                        |
| Edit depth                     | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | Always when assigned                     | —                                        |
| Edit topics                    | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | Always when assigned                     | —                                        |
| Create customer                | Always                           | Always                           | Always                                   | Always                                   | Always                                   |
| Transfer customer              | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | Always when assigned                     | Always when assigned                     |
| Edit customer information      | Always                           | `scoping`, `rejected-by-program` | —                                        | —                                        | —                                        |
| Delete customer                | Always                           | —                                | —                                        | —                                        | —                                        |
| Create organization            | Always                           | Always                           | Always                                   | Always                                   | Always                                   |
| Transfer organization          | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | —                                        | —                                        |
| Edit organization information  | Always                           | `scoping`, `rejected-by-program` | —                                        | —                                        | —                                        |
| Delete organization            | Always                           | —                                | —                                        | —                                        | —                                        |
| Edit projected start date      | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | Always when assigned                     | Always when assigned                     |
| Edit projected completion date | Always                           | —                                | `assigned-to-expert`, `providing-ta`     | `assigned-to-expert`, `providing-ta`     | `assigned-to-expert`, `providing-ta`     |
| Edit actual completion date    | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | Always when assigned                     | Always when assigned                     |
| Assign forward to reception    | Always                           | —                                | —                                        | —                                        | —                                        |
| Assign back to reception       | Always                           | —                                | `assigned-to-program`, `rejected-by-lab` | —                                        | —                                        |
| Assign forward to program      | Always                           | `scoping`, `rejected-by-program` | —                                        | —                                        | —                                        |
| Assign back to program         | Always                           | —                                | —                                        | `assigned-to-lab`, `rejected-by-expert`  | —                                        |
| Assign forward to lab          | Always                           | —                                | `assigned-to-program`, `rejected-by-lab` | —                                        | —                                        |
| Assign back to lab             | Always                           | —                                | —                                        | —                                        | `assigned-to-expert`, `providing-ta`     |
| Assign forward to Expert       | Always                           | —                                | `assigned-to-lab`, `rejected-by-expert`  | `assigned-to-lab`, `rejected-by-expert`  | —                                        |
| Start closeout                 | Always                           | —                                | `providing-ta`                           | `providing-ta`                           | `providing-ta`                           |
| Edit closeout responses        | Always                           | —                                | Always                                   | Always                                   | Always                                   |
| Submit closeout                | Always                           | —                                | `closeout-started`, `closeout-more-info` | `closeout-started`, `closeout-more-info` | `closeout-started`, `closeout-more-info` |
| Approve closeout by lab        | `closeout-review-by-lab`         | —                                | —                                        | `closeout-review-by-lab`                 | —                                        |
| Reject closeout by lab         | `closeout-review-by-lab`         | —                                | —                                        | `closeout-review-by-lab`                 | —                                        |
| Approve closeout by program    | `closeout-review-by-program`     | —                                | `closeout-review-by-program`             | —                                        | —                                        |
| Reject closeout by program     | `closeout-review-by-program`     | —                                | `closeout-review-by-program`             | —                                        | —                                        |
| Cancel request                 | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | —                                        | —                                        |
| Reopen request                 | `completed`, `unable-to-address` | `completed`, `unable-to-address` | `completed`, `unable-to-address`         | —                                        | —                                        |
| Add notes                      | Always                           | `scoping`, `rejected-by-program` | Always when assigned                     | Always                                   | Always                                   |
| Delete notes                   | Always                           | `scoping`, `rejected-by-program` | Always                                   | Always                                   | Always                                   |
| Add attachments                | Always                           | `scoping`, `rejected-by-program` | Always                                   | Always                                   | Always                                   |
| Delete attachments             | Always                           | `scoping`, `rejected-by-program` | Always                                   | Always                                   | Always                                   |

## View your roles

Open the menu with your name and select **Profile**. The profile lists system roles and organizational roles separately. Each organizational role identifies the applicable program and laboratory.

> **Screenshot placeholder:** Profile page showing system and organizational role cards.

If no roles are listed, use the role request form linked from the profile page. Having a TA Connect login does not by itself provide access to request work.

## Manage roles

The **Roles Manager** appears on the profile page only when you are allowed to manage assignments. Program Leads can manage applicable laboratory-level Lab Lead and Expert assignments. Admins can also manage Program Lead assignments.

To add a role:

1. Click **Add role**.
2. Select the user, level, role, program, and laboratory as applicable.
3. Click **Save**.

Use the edit icon to change an assignment. Use the delete icon to revoke it. Revoking a role removes the user's access associated with that assignment.

> **Screenshot placeholder:** Roles Manager with Add role, edit, and revoke controls.
