/**
 * Label — átomo de etiqueta de formulario. Úsese con `htmlFor` apuntando al
 * `id` del control para asociación accesible.
 */
import * as React from "react";
import { cn } from "../lib/cn";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, htmlFor, ...props }, ref) => (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";
