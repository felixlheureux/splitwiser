import * as React from "react"
import { cn } from "../../lib/utils"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onOpenAutoFocus,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const childrenArray = React.Children.toArray(children);
  const headerIndex = childrenArray.findIndex(
    (child) =>
      React.isValidElement(child) &&
      (child.type === DialogHeader ||
        (child.props as Record<string, unknown>)?.[ "data-slot" ] === "dialog-header" ||
        (child.type as { displayName?: string })?.displayName === "DialogHeader")
  );

  const header = headerIndex !== -1 ? childrenArray[headerIndex] : null;
  const body =
    headerIndex !== -1
      ? childrenArray.filter((_, idx) => idx !== headerIndex)
      : childrenArray;

  const headerChildren = React.isValidElement(header)
    ? React.Children.toArray((header.props as { children?: React.ReactNode })?.children)
    : [];

  const hasEyebrow =
    headerChildren.length > 1 &&
    React.isValidElement(headerChildren[0]) &&
    headerChildren[0].type !== DialogTitle;

  const topBar = hasEyebrow ? headerChildren[0] : (headerChildren[0] ?? header);
  const scrollableHeader = hasEyebrow ? headerChildren.slice(1) : [];

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 flex flex-col w-full max-w-[calc(100%-1.25rem)] max-h-[calc(100dvh-1.5rem)] translate-x-[-50%] translate-y-[-50%] rounded-2xl border bg-background shadow-xl duration-200 outline-none overflow-hidden sm:max-w-lg",
          className
        )}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          onOpenAutoFocus?.(e);
        }}
        {...props}
      >
        {topBar ? (
          <div className="relative shrink-0 border-b border-slate-100/80 px-5 py-3 sm:px-6 sm:py-3.5 pr-12 sm:pr-14 bg-background min-h-[44px] flex items-center">
            {topBar}
            {showCloseButton && (
              <DialogPrimitive.Close
                data-slot="dialog-close"
                className="absolute top-3 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            )}
          </div>
        ) : (
          showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="absolute top-4 right-4 z-10 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 scroll-pb-6 flex flex-col gap-4">
          {scrollableHeader.length > 0 && (
            <div className="flex flex-col gap-1 -mb-1 text-center sm:text-left">
              {scrollableHeader}
            </div>
          )}
          {body}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}
DialogHeader.displayName = "DialogHeader"

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
