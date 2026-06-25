import {
  manageableRolesQueryOptions,
  useManageableRoleCreateMutation,
  useManageableRoleDeleteMutation,
  useManageableRoleUpdateMutation,
} from '@/api/queryOptions';
import {
  TAManageableRoleAssignment,
  TAManageableRoleMutation,
  TAManageableRolesResponse,
  TARole,
} from '@/api/dashboard/types';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

const emptyForm: TAManageableRoleMutation = {
  location: 'lab',
  user: 0,
  role: 0,
  program: undefined,
  lab: undefined,
};

const toForm = (assignment: TAManageableRoleAssignment): TAManageableRoleMutation => ({
  assignment_id: assignment.assignment_id,
  location: assignment.location as 'program' | 'lab',
  user: assignment.user.id,
  role: assignment.role.id,
  program: assignment.location === 'program' ? assignment.instance?.id : assignment.program?.id,
  lab: assignment.location === 'lab' ? assignment.instance?.id : undefined,
});

export const RolesManager: React.FC = () => {
  const { data } = useSuspenseQuery(manageableRolesQueryOptions());
  const manageableRoles = data as TAManageableRolesResponse | null;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TAManageableRoleMutation>(emptyForm);

  const createMutation = useManageableRoleCreateMutation();
  const updateMutation = useManageableRoleUpdateMutation();
  const deleteMutation = useManageableRoleDeleteMutation();

  const rows = manageableRoles?.assignments || [];
  const labsByProgram = useMemo(() => {
    const programs = manageableRoles?.programs || [];
    return new Map(programs.map((program) => [program.id, new Set(program.labs)]));
  }, [manageableRoles?.programs]);

  if (!manageableRoles || manageableRoles.programs.length === 0) {
    return null;
  }

  const selectedProgramLabs = manageableRoles.labs.filter((lab) =>
    form.program ? labsByProgram.get(form.program)?.has(lab.id) : true
  );
  const roleOptions = manageableRoles.roles.filter((role) =>
    form.location === 'program'
      ? role.name === TARole.ProgramLead
      : role.name === TARole.Expert || role.name === TARole.LabLead
  );

  const handleAdd = () => {
    const firstProgram = manageableRoles.programs[0]?.id;
    const firstLab = manageableRoles.labs.find((lab) =>
      firstProgram ? labsByProgram.get(firstProgram)?.has(lab.id) : true
    )?.id;
    setForm({
      ...emptyForm,
      user: manageableRoles.users[0]?.id || 0,
      role: manageableRoles.roles.find((role) => role.name === TARole.Expert)?.id || 0,
      program: firstProgram,
      lab: firstLab,
    });
    setDialogOpen(true);
  };

  const handleEdit = (assignment: TAManageableRoleAssignment) => {
    setForm(toForm(assignment));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (form.assignment_id) {
      await updateMutation.mutateAsync(form);
    } else {
      await createMutation.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  const columns: GridColDef<TAManageableRoleAssignment>[] = [
    {
      field: 'user',
      headerName: 'User',
      flex: 1,
      minWidth: 220,
      valueGetter: (_, row) => row.user.name || row.user.email,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 140,
      valueGetter: (_, row) => row.role.name,
    },
    {
      field: 'location',
      headerName: 'Level',
      width: 120,
      valueGetter: (_, row) => (row.location === 'program' ? 'Program' : 'Lab'),
    },
    {
      field: 'program',
      headerName: 'Program',
      flex: 1,
      minWidth: 200,
      valueGetter: (_, row) => row.program?.name || row.instance?.name || '',
    },
    {
      field: 'instance',
      headerName: 'Lab',
      flex: 1,
      minWidth: 180,
      valueGetter: (_, row) => (row.location === 'lab' ? row.instance?.name : ''),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 104,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit role">
            <IconButton size="small" onClick={() => handleEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Revoke role">
            <IconButton
              size="small"
              onClick={() =>
                deleteMutation.mutate({
                  assignment_id: row.assignment_id,
                  location: row.location as 'program' | 'lab',
                })
              }
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h2" fontWeight="bold">
            Roles Manager
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add role
        </Button>
      </Stack>
      <Paper elevation={1} sx={{ borderWidth: 1, borderColor: 'divider', borderStyle: 'solid' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => `${row.location}-${row.assignment_id}`}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{ backgroundColor: 'white' }}
        />
      </Paper>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.assignment_id ? 'Edit role' : 'Add role'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ paddingTop: 1 }}>
            <FormControl fullWidth>
              <InputLabel>User</InputLabel>
              <Select
                label="User"
                value={form.user}
                onChange={(event) => setForm({ ...form, user: Number(event.target.value) })}
              >
                {manageableRoles.users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                label="Level"
                value={form.location}
                onChange={(event) =>
                  setForm({
                    ...form,
                    location: event.target.value as 'program' | 'lab',
                    role:
                      event.target.value === 'program'
                        ? manageableRoles.roles.find((role) => role.name === TARole.ProgramLead)
                            ?.id || 0
                        : manageableRoles.roles.find((role) => role.name === TARole.Expert)?.id ||
                          0,
                  })
                }
              >
                {manageableRoles.is_admin && <MenuItem value="program">Program</MenuItem>}
                <MenuItem value="lab">Lab</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: Number(event.target.value) })}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Program</InputLabel>
              <Select
                label="Program"
                value={form.program || ''}
                onChange={(event) => {
                  const program = Number(event.target.value);
                  const lab = manageableRoles.labs.find((item) =>
                    labsByProgram.get(program)?.has(item.id)
                  )?.id;
                  setForm({ ...form, program, lab });
                }}
              >
                {manageableRoles.programs.map((program) => (
                  <MenuItem key={program.id} value={program.id}>
                    {program.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {form.location === 'lab' && (
              <FormControl fullWidth>
                <InputLabel>Lab</InputLabel>
                <Select
                  label="Lab"
                  value={form.lab || ''}
                  onChange={(event) => setForm({ ...form, lab: Number(event.target.value) })}
                >
                  {selectedProgramLabs.map((lab) => (
                    <MenuItem key={lab.id} value={lab.id}>
                      {lab.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              createMutation.isPending ||
              updateMutation.isPending ||
              !form.user ||
              !form.role ||
              !form.program ||
              (form.location === 'lab' && !form.lab)
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
