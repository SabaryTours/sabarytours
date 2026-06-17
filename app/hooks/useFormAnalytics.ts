"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  trackFormAbandon,
  trackFormStart,
  trackFormSubmit,
} from "../lib/analytics";

type Options = {
  formId: string;
  formName: string;
};

/**
 * Tracks form_start on first interaction, form_submit on success,
 * and form_abandon if the user leaves without submitting.
 */
export function useFormAnalytics({ formId, formName }: Options) {
  const startedRef = useRef(false);
  const submittedRef = useRef(false);

  const onFormInteraction = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackFormStart(formId, formName);
  }, [formId, formName]);

  const onFormSubmitSuccess = useCallback(() => {
    submittedRef.current = true;
    trackFormSubmit(formId, formName);
  }, [formId, formName]);

  useEffect(() => {
    const handleLeave = () => {
      if (startedRef.current && !submittedRef.current) {
        trackFormAbandon(formId, formName);
      }
    };

    window.addEventListener("pagehide", handleLeave);
    return () => window.removeEventListener("pagehide", handleLeave);
  }, [formId, formName]);

  return { onFormInteraction, onFormSubmitSuccess };
}
