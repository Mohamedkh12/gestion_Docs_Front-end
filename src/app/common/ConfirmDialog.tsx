"use client";

import { confirmAlert } from "react-confirm-alert";
import 'react-confirm-alert/src/react-confirm-alert.css';
import { IconAlertTriangle } from "@tabler/icons-react";

interface ConfirmDialogProps {
    message: string;
    onConfirm: () => void;
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

export function showConfirmDialog({
                                      message,
                                      onConfirm,
                                      title = "Confirmation",
                                      confirmLabel = "Oui, Supprimer",
                                      cancelLabel = "Annuler"
                                  }: ConfirmDialogProps) {
    confirmAlert({
        customUI: ({ onClose }) => {
            return (
                <div
                    className="card shadow-lg border rounded-xl p-4"
                    style={{ maxWidth: 450, margin: "0 auto", backgroundColor: "#fff" }}
                >
                    <div className="d-flex align-items-center mb-3">
                        <IconAlertTriangle size={28} className="text-danger me-2" />
                        <h3 className="card-title text-danger mb-0">{title}</h3>
                    </div>

                    <p className="text-muted mb-4" style={{ fontSize: "15px" }}>{message}</p>

                    <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-outline-secondary" onClick={onClose}>
                            {cancelLabel}
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            );
        }
    });
}
