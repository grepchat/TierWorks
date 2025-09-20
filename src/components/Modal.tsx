import React from 'react'

interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null
  return (
    <div className="tw-modal-overlay" role="dialog" aria-modal="true">
      <div className="tw-modal" onClick={(e) => e.stopPropagation()}>
        {title && <div className="tw-modal-header">{title}</div>}
        <div className="tw-modal-body">{children}</div>
        {footer && <div className="tw-modal-footer">{footer}</div>}
        <button className="tw-modal-close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <div className="tw-modal-backdrop" onClick={onClose} />
    </div>
  )
}


