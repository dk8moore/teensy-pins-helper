import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertCircle } from 'lucide-react';

const ErrorState = ({ error, onRetry, className = "" }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">
            {error}
          </div>
        </div>
      </div>
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Retry Loading
        </Button>
      )}
    </div>
  );
};

export default ErrorState;