import React from 'react';
import { AlertCircle } from 'lucide-react';

const ValidationErrors = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h4 className="font-semibold">Configuration Validation Errors</h4>
        </div>
        <ul className="space-y-2 text-sm text-destructive">
          {errors.map((error, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive"></span>
              <span>{error.message}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ValidationErrors;
