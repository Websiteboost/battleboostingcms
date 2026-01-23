'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Mail, Lock, User, UserPlus, Trash2 } from 'lucide-react';
import { getUsers, updateUserEmail, updateUserPassword, createUser, deleteUser } from '@/app/actions/users';
import toast from 'react-hot-toast';
import { AdminGuard } from '@/components/guards/AdminGuard';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function CuentaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'email' | 'password' | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Estados para crear usuario
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'admin' | 'user'>('user');
  const [creating, setCreating] = useState(false);

  // Estados para eliminar usuario
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getUsers();
    if (result.success && result.data) {
      setUsers(result.data as User[]);
    } else {
      toast.error(result.error || 'Error al cargar usuarios');
    }
    setLoading(false);
  };

  const handleEditEmail = (user: User) => {
    setEditingUserId(user.id);
    setEditingField('email');
    setNewEmail(user.email);
  };

  const handleEditPassword = (userId: string) => {
    setEditingUserId(userId);
    setEditingField('password');
    setNewPassword('');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingField(null);
    setNewEmail('');
    setNewPassword('');
  };

  const handleSaveEmail = async (userId: string) => {
    if (!newEmail.trim()) {
      toast.error('El email no puede estar vacío');
      return;
    }

    setSaving(true);
    const result = await updateUserEmail(userId, newEmail);
    
    if (result.success) {
      toast.success(result.message || 'Email actualizado');
      await loadUsers();
      handleCancelEdit();
    } else {
      toast.error(result.error || 'Error al actualizar email');
    }
    setSaving(false);
  };

  const handleSavePassword = async (userId: string) => {
    if (!newPassword.trim()) {
      toast.error('La contraseña no puede estar vacía');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSaving(true);
    const result = await updateUserPassword(userId, newPassword);
    
    if (result.success) {
      toast.success(result.message || 'Contraseña actualizada');
      handleCancelEdit();
    } else {
      toast.error(result.error || 'Error al actualizar contraseña');
    }
    setSaving(false);
  };

  const handleCreateUser = async () => {
    if (!createEmail.trim()) {
      toast.error('El email es requerido');
      return;
    }

    if (!createPassword.trim()) {
      toast.error('La contraseña es requerida');
      return;
    }

    if (createPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCreating(true);
    const result = await createUser(createEmail, createPassword, createRole);
    
    if (result.success) {
      toast.success(result.message || 'Usuario creado exitosamente');
      setShowCreateForm(false);
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('user');
      await loadUsers();
    } else {
      toast.error(result.error || 'Error al crear usuario');
    }
    setCreating(false);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setCreateEmail('');
    setCreatePassword('');
    setCreateRole('user');
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    const result = await deleteUser(userToDelete.id);
    
    if (result.success) {
      toast.success(result.message || 'Usuario eliminado exitosamente');
      setDeleteModalOpen(false);
      setUserToDelete(null);
      await loadUsers();
    } else {
      toast.error(result.error || 'Error al eliminar usuario');
    }
    setDeleting(false);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold neon-text">Gestión de Cuenta</h1>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-purple"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold neon-text">Gestión de Cuenta</h1>
        </div>

      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User size={20} className="text-cyber-purple" />
              Usuarios del Sistema
            </h2>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2"
            >
              <UserPlus size={18} />
              {showCreateForm ? 'Cancelar' : 'Crear Usuario'}
            </Button>
          </div>

          {/* Formulario de creación */}
          {showCreateForm && (
            <div className="p-4 bg-cyber-purple/10 rounded-lg border border-cyber-purple/30 space-y-4">
              <h3 className="text-md font-semibold text-white flex items-center gap-2">
                <UserPlus size={18} className="text-cyber-purple" />
                Nuevo Usuario
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="email"
                  label="Email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                />

                <Input
                  type="password"
                  label="Contraseña"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5 sm:mb-2">
                  Rol de Usuario
                </label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as 'admin' | 'user')}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800/50 border border-cyber-purple/30 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:border-cyber-purple focus:ring-2 focus:ring-cyber-purple/50 transition-colors"
                >
                  <option value="user">Usuario Normal</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={handleCancelCreate}
                  variant="secondary"
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={creating}
                  className="flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  {creating ? 'Creando...' : 'Crear Usuario'}
                </Button>
              </div>
            </div>
          )}

          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay usuarios en el sistema</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyber-purple/30 transition-colors"
                >
                  {/* Header del usuario */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyber-purple/20 flex items-center justify-center">
                        <User size={20} className="text-cyber-purple" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
                        <p className="text-xs text-gray-400">
                          Desde {new Date(user.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteClick(user)}
                      variant="danger"
                      className="px-3 py-2 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>

                  {/* Email */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Mail size={16} className="text-cyber-cyan" />
                        Email
                      </label>
                      {editingUserId !== user.id && (
                        <button
                          onClick={() => handleEditEmail(user)}
                          className="text-xs text-cyber-purple hover:text-cyber-pink transition-colors"
                        >
                          Editar
                        </button>
                      )}
                    </div>

                    {editingUserId === user.id && editingField === 'email' ? (
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="nuevo@email.com"
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          onClick={() => handleSaveEmail(user.id)}
                          disabled={saving}
                          className="px-4"
                        >
                          {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="secondary"
                          disabled={saving}
                          className="px-4"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 bg-slate-900/50 px-3 py-2 rounded border border-slate-700">
                        {user.email}
                      </p>
                    )}
                  </div>

                  {/* Contraseña */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Lock size={16} className="text-cyber-pink" />
                        Contraseña
                      </label>
                      {editingUserId !== user.id && (
                        <button
                          onClick={() => handleEditPassword(user.id)}
                          className="text-xs text-cyber-purple hover:text-cyber-pink transition-colors"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>

                    {editingUserId === user.id && editingField === 'password' ? (
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nueva contraseña (mín. 6 caracteres)"
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          onClick={() => handleSavePassword(user.id)}
                          disabled={saving}
                          className="px-4"
                        >
                          {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="secondary"
                          disabled={saving}
                          className="px-4"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 bg-slate-900/50 px-3 py-2 rounded border border-slate-700">
                        ••••••••••
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        title="⚠️ Confirmar Eliminación"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-950/30 border border-red-500/50 rounded-lg">
            <p className="text-white font-semibold mb-2">¿Estás seguro?</p>
            <p className="text-sm text-gray-300">
              Estás a punto de eliminar la cuenta de:
            </p>
            <p className="text-sm text-white font-mono mt-2 bg-slate-900/50 px-3 py-2 rounded">
              {userToDelete?.email}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCancelDelete}
              variant="secondary"
              disabled={deleting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteUser}
              variant="danger"
              disabled={deleting}
              className="w-full sm:flex-1 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              {deleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </AdminGuard>
  );
}
