import Modal from "@/components/Modal";
import { User, Role } from "@/services/user.service";

interface UserModalProps {
  isOpen: boolean;
  editingUser: User | null;
  formData: {
    username: string;
    password: string;
    roleId: string;
    isActive: boolean;
  };
  roles: Role[];
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: {
    username: string;
    password: string;
    roleId: string;
    isActive: boolean;
  }) => void;
}

export default function UserModal({
  isOpen,
  editingUser,
  formData,
  roles,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  onFormDataChange,
}: UserModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUser ? "កែប្រែអ្នកប្រើប្រាស់" : "បន្ថែមអ្នកប្រើប្រាស់"}
    >
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ឈ្មោះអ្នកប្រើប្រាស់
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              onFormDataChange({ ...formData, username: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            disabled={!!editingUser}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ពាក្យសម្ងាត់
            {editingUser && (
              <span className="text-xs text-slate-500 ml-2">
                (ទុកទទេដើម្បីមិនផ្លាស់ប្តូរ)
              </span>
            )}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              onFormDataChange({ ...formData, password: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required={!editingUser}
            minLength={6}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">តួនាទី</label>
          <select
            value={formData.roleId}
            onChange={(e) =>
              onFormDataChange({ ...formData, roleId: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">ជ្រើសរើសតួនាទី</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  isActive: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">សកម្ម</span>
          </label>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "កំពុងដំណើរការ..."
              : editingUser
              ? "ធ្វើបច្ចុប្បន្នភាព"
              : "បង្កើត"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
          >
            បោះបង់
          </button>
        </div>
      </form>
    </Modal>
  );
}

