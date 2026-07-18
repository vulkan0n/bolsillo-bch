import { useCallback, useEffect, useState } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

import SecurityService from "@/kernel/app/SecurityService";
import {
  decryptWithAnswer,
  getBackoffMs,
  getRemainingLockoutSeconds,
  isLockedOut,
} from "@/kernel/backup/SecurityQuestionEncryption";

import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import Button from "@/atoms/Button";
import SeleneLogo from "@/atoms/SeleneLogo";

import { translate } from "@/util/translations";
import translations from "./translations";

// ----------------

interface Props {
  boot: () => Promise<void>;
}

export default function SecurityQuestionRecoveryScreen({ boot }: Props) {
  const Security = SecurityService();

  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // ----------------
  // Load security question data on mount

  useEffect(
    function loadQuestionData() {
      Security.getSecurityQuestionData().then((data) => {
        if (!data) {
          setError("No security question configured");
          return;
        }
        setQuestion(data.question);

        if (data.lockedUntil && isLockedOut(data.lockedUntil)) {
          const remaining = getRemainingLockoutSeconds(data.lockedUntil);
          setLockoutRemaining(remaining);
        }
      });
    },
    [Security]
  );

  // ----------------
  // Lockout countdown timer

  useEffect(
    function lockoutTimer() {
      if (lockoutRemaining <= 0) {
        return undefined;
      }

      const interval = setInterval(() => {
        setLockoutRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    },
    [lockoutRemaining]
  );

  // ----------------

  const handleReveal = useCallback(async () => {
    if (!answer.trim()) {
      setError(translate(translations.answerRequired));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await Security.getSecurityQuestionData();
      if (!data) {
        setError("No security question configured");
        setIsLoading(false);
        return;
      }

      await decryptWithAnswer(data.blob, answer.trim());

      // Success: reset attempts and lockout, then unlock the app
      data.failedAttempts = 0;
      data.lockedUntil = null;
      await Security.setSecurityQuestionData(data);

      await boot();
    } catch (e) {
      // Wrong answer — GCM decrypt throws
      const data = await Security.getSecurityQuestionData();
      if (data) {
        const newAttempts = data.failedAttempts + 1;
        const backoffMs = getBackoffMs(newAttempts);
        const lockedUntil = new Date(Date.now() + backoffMs).toISOString();

        data.failedAttempts = newAttempts;
        data.lockedUntil = lockedUntil;
        await Security.setSecurityQuestionData(data);

        if (backoffMs > 0) {
          const remaining = getRemainingLockoutSeconds(lockedUntil);
          setLockoutRemaining(remaining);
          setError(
            translate(translations.tooManyAttempts, {
              seconds: String(remaining),
            })
          );
        } else {
          setError(translate(translations.wrongAnswer));
        }
      } else {
        setError(translate(translations.wrongAnswer));
      }
    } finally {
      setIsLoading(false);
      setAnswer("");
    }
  }, [answer, Security]);

  // ----------------

  return (
    <FullColumn className="bg-neutral-100 dark:bg-neutral-900">
      <ViewHeader
        title={translate(translations.questionRecoveryTitle)}
        back={-1}
      />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center mb-6">
          <SeleneLogo className="w-20 h-20" />
        </div>

        {question && (
          <div className="mb-6">
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 text-center">
              {question}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-error-light/20 dark:bg-error-dark/30 border border-error-light dark:border-error-dark rounded text-error dark:text-error-light text-sm text-center">
            {error}
          </div>
        )}

        {lockoutRemaining > 0 ? (
          <div className="text-center">
            <p className="text-neutral-700 dark:text-neutral-300">
              {translate(translations.tooManyAttempts, {
                seconds: String(lockoutRemaining),
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {translate(translations.enterAnswer)}
              </label>
              <div className="relative">
                <input
                  type={showAnswer ? "text" : "password"}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={translate(translations.enterAnswer)}
                  className="w-full p-3 pr-12 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-center"
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowAnswer((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  tabIndex={-1}
                >
                  {showAnswer ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>

            <Button
              label={translate(translations.revealSeed)}
              onClick={handleReveal}
              fullWidth
              disabled={isLoading}
            />
          </div>
        )}
      </div>
    </FullColumn>
  );
}
