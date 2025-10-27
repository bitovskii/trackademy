// Example usage of DeleteConfirmationModal component

/*
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';

// Usage in component:

// State for modal
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [deletingItem, setDeletingItem] = useState<YourItemType | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

// Open delete modal
const handleDeleteClick = (item: YourItemType) => {
  setDeletingItem(item);
  setIsDeleteModalOpen(true);
};

// Close delete modal
const handleCloseDeleteModal = () => {
  setIsDeleteModalOpen(false);
  setDeletingItem(null);
};

// Confirm deletion
const handleConfirmDelete = async () => {
  if (!deletingItem) return;
  
  setIsDeleting(true);
  try {
    await ApiService.deleteItem(deletingItem.id);
    // Reload data or update state
    await loadItems();
    handleCloseDeleteModal();
  } catch (error) {
    console.error('Error deleting item:', error);
  } finally {
    setIsDeleting(false);
  }
};

// In JSX:
<DeleteConfirmationModal
  isOpen={isDeleteModalOpen}
  onClose={handleCloseDeleteModal}
  onConfirm={handleConfirmDelete}
  title="Удалить элемент"
  message="Вы действительно хотите удалить этот элемент? Это действие нельзя отменить."
  itemName={deletingItem?.name}
  isLoading={isDeleting}
  danger={true} // For red color scheme, false for orange
/>

*/

export const EXAMPLE_USAGE = `
Basic example:
<DeleteConfirmationModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  onConfirm={handleDelete}
  title="Удалить пользователя"
  message="Вы действительно хотите удалить этого пользователя?"
  itemName="Иван Иванов"
  danger={true}
/>

With loading state:
<DeleteConfirmationModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  onConfirm={handleDelete}
  title="Удалить файл"
  message="Файл будет удален навсегда"
  itemName="document.pdf"
  isLoading={isDeleting}
  danger={false} // Orange color scheme
/>
`;