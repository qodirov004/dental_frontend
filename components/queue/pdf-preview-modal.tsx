"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, X } from "lucide-react"
import { useEffect, useRef } from "react"

interface PDFPreviewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    pdfUrl: string | null
    title?: string
}

export function PDFPreviewModal({ open, onOpenChange, pdfUrl, title = "Chekni ko'rish" }: PDFPreviewModalProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const handlePrint = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow?.print()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 text-left">
                    <div>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription className="sr-only">
                            Chekni ko'rish va chop etish oynasi
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" />
                            Chop etish
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 bg-muted relative">
                    {pdfUrl ? (
                        <iframe
                            ref={iframeRef}
                            src={pdfUrl}
                            className="w-full h-full border-none"
                            title="PDF Preview"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            Yuklanmoqda...
                        </div>
                    )}
                </div>
                <DialogFooter className="p-4 border-t sm:justify-end">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Yopish
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
