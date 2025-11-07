// Универсальная система модальных окон
export { default as UniversalModal } from './ui/UniversalModal';
export { useUniversalModal } from '../hooks/useUniversalModal';
export { modalConfigs } from '../config/modalConfigs';
export type { EntityType, ModalMode } from '../config/modalConfigs';

// Готовые формы для использования
export { UserForm } from './forms/UserForm';
export { RoomForm, SubjectForm, GroupForm } from './forms';

// Валидаторы
export { 
  createUserValidator, 
  createRoomValidator, 
  createSubjectValidator, 
  createGroupValidator,
  createOrganizationValidator 
} from '../utils/validators';

// Универсальный компонент для создания и редактирования пользователей (legacy)
export { default as UserModal } from './UserModal';

// Специализированные обертки для обратной совместимости (legacy)
export { default as CreateUserModal } from './CreateUserModal'; 
export { default as EditUserModal } from './EditUserModal';

// Экспорт модальных окон
export { ExportAttendanceModal } from './ExportAttendanceModal';
export { StudentPaymentsModal } from './StudentPaymentsModal';