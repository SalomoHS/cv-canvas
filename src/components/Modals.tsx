"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useStore } from "@/store/useStore";

interface AddCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (crateId: string) => void;
}

export function AddCVModal({ isOpen, onClose, onCreated }: AddCVModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addCrate, addVersion, crates, setActiveTab } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const wasEmpty = crates.length === 0;
      const crate = await addCrate(name.trim());
      await addVersion("Version 0", crate.id);
      setName("");
      onClose();
      onCreated?.(crate.id);
      if (wasEmpty) {
        setActiveTab("profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Curriculum Vitae"
      footer={
        <>
          <button onClick={handleClose} className="modal-btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className="modal-btn-primary"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create CV
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cv-name" className="modal-label">
            Name
          </label>
          <input
            id="cv-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Software Engineer CV"
            className="modal-input"
            autoFocus
          />
          <p className="modal-hint">
            Give your CV a descriptive name to identify it easily.
          </p>
        </div>
      </form>
    </Modal>
  );
}

interface AddVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  crateId?: string;
}

export function AddVersionModal({ isOpen, onClose, crateId }: AddVersionModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addVersion, cvVersions } = useStore();

  const crateVersions = crateId
    ? cvVersions.filter((v) => v.crateId === crateId)
    : cvVersions.filter((v) => !v.crateId);
  const nextVersionNumber = crateVersions.length + 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await addVersion(name.trim(), crateId);
      setName("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Version"
      footer={
        <>
          <button onClick={handleClose} className="modal-btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className="modal-btn-primary"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Version
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="version-name" className="modal-label">
            Version Name
          </label>
          <input
            id="version-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`e.g., Version ${nextVersionNumber}`}
            className="modal-input"
            autoFocus
          />
          <p className="modal-hint">
            Name your version to track changes (e.g., &quot;Final Draft&quot;, &quot;Version 1&quot;).
          </p>
        </div>
      </form>
    </Modal>
  );
}

interface AddSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSummaryModal({ isOpen, onClose }: AddSummaryModalProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addSummary } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await addSummary(name.trim(), content.trim() || "New About Me version...");
      setName("");
      setContent("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setContent("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New About Me Version"
      footer={
        <>
          <button onClick={handleClose} className="modal-btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className="modal-btn-primary"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Version
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="summary-name" className="modal-label">
            Version Name
          </label>
          <input
            id="summary-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Version 1"
            className="modal-input"
            autoFocus
          />
          <p className="modal-hint">
            Name your About Me version to track different drafts.
          </p>
        </div>
        <div>
          <label htmlFor="summary-content" className="modal-label">
            Content <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <textarea
            id="summary-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your About Me content here..."
            className="modal-input min-h-[100px] resize-y"
            rows={4}
          />
          <p className="modal-hint">
            Your professional summary or bio. You can always edit this later.
          </p>
        </div>
      </form>
    </Modal>
  );
}

interface DeleteCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  crateId?: string;
  crateName?: string;
}

export function DeleteCVModal({ isOpen, onClose, crateId, crateName }: DeleteCVModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { deleteCrate, cvVersions } = useStore();

  const crateVersions = crateId
    ? cvVersions.filter((v) => v.crateId === crateId)
    : [];
  const versionCount = crateVersions.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crateId || confirmText !== crateName) return;

    setIsLoading(true);
    try {
      await deleteCrate(crateId);
      setConfirmText("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const isConfirmValid = confirmText === crateName;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Curriculum Vitae"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-danger-light rounded-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <p className="text-sm font-medium text-danger">This action cannot be undone.</p>
            <p className="text-xs text-text-secondary mt-1">
              All {versionCount} version{versionCount !== 1 ? "s" : ""} will be permanently deleted.
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary">
          To confirm, type <strong className="text-text-primary">{crateName}</strong> below:
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type the CV name to confirm"
            className="modal-input"
            autoFocus
          />
        </form>
      </div>

      <div className="modal-footer">
        <button onClick={handleClose} className="modal-btn-secondary">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isConfirmValid || isLoading}
          className="modal-btn-danger"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
              Deleting...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete CV
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}

interface DeleteVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  versionId?: string;
  versionName?: string;
}

export function DeleteVersionModal({ isOpen, onClose, versionId, versionName }: DeleteVersionModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { deleteVersion } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionId || confirmText !== versionName) return;

    setIsLoading(true);
    try {
      await deleteVersion(versionId);
      setConfirmText("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const isConfirmValid = confirmText === versionName;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Version"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-danger-light rounded-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <p className="text-sm font-medium text-danger">This action cannot be undone.</p>
            <p className="text-xs text-text-secondary mt-1">
              The version &quot;{versionName}&quot; and its data will be permanently deleted.
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary">
          To confirm, type <strong className="text-text-primary">{versionName}</strong> below:
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type the version name to confirm"
            className="modal-input"
            autoFocus
          />
        </form>
      </div>

      <div className="modal-footer">
        <button onClick={handleClose} className="modal-btn-secondary">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isConfirmValid || isLoading}
          className="modal-btn-danger"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
              Deleting...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete Version
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}