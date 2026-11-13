import { useEffect, useRef } from 'react';
import './Modal.css';

function Modal({ open, onClose, title, children }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    const handleBackdropClick = (e) => {
        if (e.target === dialogRef.current) onClose();
    };

    return (
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
            onClick={handleBackdropClick}
        >
            <div className="modal-body">
                <h2>{title}</h2>
                {open && children}
            </div>
        </dialog>
    );
}

export default Modal;