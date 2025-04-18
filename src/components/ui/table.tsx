import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    containerClassName?: string;
    maxHeight?: string | number | null;
    stickyHeader?: boolean;
  }
>(
  (
    {
      className,
      containerClassName,
      maxHeight = null,
      stickyHeader = false,
      ...props
    },
    ref
  ) => {
    // Create CSS variable for border color to use in box-shadow
    React.useEffect(() => {
      if (stickyHeader) {
        document.documentElement.style.setProperty(
          "--border",
          getComputedStyle(document.documentElement).getPropertyValue(
            "--border-primary"
          ) || "#e5e7eb"
        );
      }
    }, [stickyHeader]);

    return (
      <div
        className={cn("relative w-full overflow-hidden", containerClassName)}
      >
        <div
          className={cn("overflow-y-auto", maxHeight === null && "h-full")}
          style={{
            ...(maxHeight !== null ? { maxHeight } : {}),
            // Reserve space for scrollbar to avoid content shift
            scrollbarGutter: "stable",
          }}
        >
          <table
            ref={ref}
            className={cn("w-full caption-bottom text-sm", className)}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }
>(({ className, sticky = false, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "[&_tr]:border-b",
      sticky && "sticky top-0 z-10 bg-background isolate",
      className
    )}
    style={
      sticky
        ? {
            // Create persistent bottom border for header when sticky
            boxShadow: "inset 0 -1px 0 var(--border)",
          }
        : undefined
    }
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <tbody ref={ref} {...props} />);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }
>(({ className, sticky = false, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "bg-muted/50 font-medium [&>tr]:last:border-b-0",
      sticky && "sticky bottom-0 z-10 bg-background",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
