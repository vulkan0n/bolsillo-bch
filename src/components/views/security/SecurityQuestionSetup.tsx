import { useState } from "react";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import Button from "@/atoms/Button";
import FullColumn from "@/layout/FullColumn";

import { translate } from "@/util/translations";
import translations from "./translations";

// ----------------

const PREDEFINED_QUESTIONS = [
  {
    key: "pet",
    text: {
      en: "What is the name of your first pet?",
      es: "¿Cuál es el nombre de tu primera mascota?",
    },
  },
  {
    key: "school",
    text: {
      en: "What is the name of your high school?",
      es: "¿Cuál es el nombre de tu escuela secundaria?",
    },
  },
  {
    key: "food",
    text: {
      en: "What is your favorite food?",
      es: "¿Cuál es tu comida favorita?",
    },
  },
  {
    key: "city",
    text: {
      en: "What city were you born in?",
      es: "¿En qué ciudad naciste?",
    },
  },
  {
    key: "friend",
    text: {
      en: "What is the name of your childhood best friend?",
      es: "¿Cuál es el nombre de tu mejor amigo/a de la infancia?",
    },
  },
  {
    key: "custom",
    text: { en: "Custom question", es: "Personalizada" },
  },
];

function getQuestionText(q: { en: string; es: string }): string {
  return q.es || q.en;
}

// ----------------

export interface SecurityQuestionSetupResult {
  question: string;
  questionCustom: boolean;
  answer: string;
}

interface SecurityQuestionSetupProps {
  onComplete: (result: SecurityQuestionSetupResult) => void;
  onCancel: () => void;
}

// ----------------

export default function SecurityQuestionSetup({
  onComplete,
  onCancel,
}: SecurityQuestionSetupProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [confirmAnswer, setConfirmAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConfirmAnswer, setShowConfirmAnswer] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"select" | "answer">("select");

  // ----------------

  const handleSelectQuestion = (key: string) => {
    setSelectedKey(key);
    setError("");

    if (key === "custom") {
      return;
    }

    setStep("answer");
  };

  const handleContinueCustom = () => {
    if (!customQuestion.trim()) {
      setError(translate(translations.questionRequired));
      return;
    }
    setStep("answer");
  };

  const handleSubmit = () => {
    setError("");

    if (!answer.trim()) {
      setError(translate(translations.answerRequired));
      return;
    }

    if (answer !== confirmAnswer) {
      setError(translate(translations.answersDoNotMatch));
      return;
    }

    let question: string;
    let isQuestionCustom = false;

    if (selectedKey === "custom") {
      question = customQuestion.trim();
      isQuestionCustom = true;
    } else {
      const matched = PREDEFINED_QUESTIONS.find((pq) => pq.key === selectedKey);
      question = matched ? getQuestionText(matched.text) : "";
    }

    if (!question) {
      setError(translate(translations.questionRequired));
      return;
    }

    onComplete({
      question,
      questionCustom: isQuestionCustom,
      answer: answer.trim(),
    });
  };

  // ----------------

  const handleBack = () => {
    if (step === "answer") {
      setStep("select");
      setError("");
    } else {
      onCancel();
    }
  };

  // ----------------

  const customTitle =
    selectedKey === "custom"
      ? getQuestionText(PREDEFINED_QUESTIONS[5].text)
      : translate(translations.securityQuestion);

  return (
    <FullColumn className="bg-neutral-100 dark:bg-neutral-900">
      {/* Custom header with back button */}
      <div className="sticky top-0 z-50 w-full grid grid-cols-6 bg-neutral-900 dark:bg-black text-xl text-neutral-25 font-bold py-3">
        <div className="col-span-1 flex items-center justify-center">
          <button
            type="button"
            className="flex items-center justify-center cursor-pointer"
            onClick={handleBack}
          >
            {step === "select" ? (
              <CloseOutlined className="text-xl" />
            ) : (
              <ArrowLeftOutlined className="text-xl" />
            )}
          </button>
        </div>
        <div className="text-center col-span-4 flex items-center justify-center">
          {customTitle}
        </div>
        <div className="col-span-1 flex items-center justify-center" />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-error-light/20 dark:bg-error-dark/30 border border-error-light dark:border-error-dark rounded text-error dark:text-error-light text-sm text-center">
            {error}
          </div>
        )}

        {step === "select" && (
          <div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              {translate(translations.selectQuestion)}
            </p>

            <div className="space-y-2">
              {PREDEFINED_QUESTIONS.slice(0, 5).map((q) => (
                <button
                  key={q.key}
                  type="button"
                  onClick={() => handleSelectQuestion(q.key)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedKey === q.key
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  {getQuestionText(q.text)}
                </button>
              ))}
            </div>

            {/* Custom question */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => handleSelectQuestion("custom")}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedKey === "custom"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                    : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                }`}
              >
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {getQuestionText(PREDEFINED_QUESTIONS[5].text)}
                </span>
              </button>

              {selectedKey === "custom" && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder={translate(
                      translations.customQuestionPlaceholder
                    )}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    autoFocus
                  />
                  <div className="mt-3">
                    <Button
                      label={translate(translations.confirmAnswer)}
                      onClick={handleContinueCustom}
                      fullWidth
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "answer" && (
          <div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              {selectedKey === "custom"
                ? customQuestion
                : getQuestionText(
                    PREDEFINED_QUESTIONS.find((q) => q.key === selectedKey)
                      ?.text ?? { en: "", es: "" }
                  )}
            </p>

            <div className="mt-6 space-y-4">
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
                    className="w-full p-3 pr-12 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    autoFocus
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

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {translate(translations.confirmAnswer)}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmAnswer ? "text" : "password"}
                    value={confirmAnswer}
                    onChange={(e) => setConfirmAnswer(e.target.value)}
                    placeholder={translate(translations.confirmAnswer)}
                    className="w-full p-3 pr-12 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmAnswer((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    tabIndex={-1}
                  >
                    {showConfirmAnswer ? (
                      <EyeInvisibleOutlined />
                    ) : (
                      <EyeOutlined />
                    )}
                  </button>
                </div>
              </div>

              <Button
                label={translate(translations.setupSecurityQuestion)}
                onClick={handleSubmit}
                fullWidth
              />
            </div>
          </div>
        )}
      </div>

      {/* Skip button on select step */}
      {step === "select" && (
        <div className="p-4 border-t border-neutral-300 dark:border-neutral-600">
          <Button
            label={translate(translations.skipSecurityQuestion)}
            onClick={onCancel}
            fullWidth
            bgColor="bg-neutral-200 dark:bg-neutral-700"
            activeBgColor="bg-neutral-300 dark:bg-neutral-600"
            labelColor="text-neutral-800 dark:text-neutral-100"
          />
        </div>
      )}
    </FullColumn>
  );
}
