import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useAppData } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import type { Quiz } from "../../types";

interface Props {
  quiz: Quiz;
  onBack: () => void;
  onComplete: () => void;
}

export default function QuizAttemptPage({ quiz, onBack, onComplete }: Props) {
  const { currentUser } = useAuth();
  const { addQuizResult } = useAppData();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correct = 0;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctAnswer) correct++;
    }
    setScore(correct);
    setSubmitted(true);
    if (currentUser) {
      addQuizResult({
        userId: currentUser.id,
        quizId: quiz.id,
        score: correct,
        total: quiz.questions.length,
      });
    }
  };

  const pct = Math.round((score / quiz.questions.length) * 100);

  return (
    <div
      className="flex-1 p-4 sm:p-6 w-full max-w-2xl mx-auto"
      data-ocid="quiz_attempt.page"
    >
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
        data-ocid="quiz_attempt.back.button"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Quizzes
      </button>

      <div className="glass-card p-6 mb-6">
        <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge className="bg-white/10 text-white/70 border border-white/20">
            {quiz.subject}
          </Badge>
          <span className="text-xs text-white/60">
            {quiz.questions.length} questions
          </span>
          <span className="text-xs text-white/60">Due: {quiz.dueDate}</span>
        </div>
      </div>

      {quiz.questions.length === 0 ? (
        <div
          className="glass-card p-8 text-center"
          data-ocid="quiz_attempt.empty_state"
        >
          <p className="text-white/60">
            No questions have been added to this quiz yet.
          </p>
          <Button
            onClick={onBack}
            className="mt-4"
            data-ocid="quiz_attempt.back.button"
          >
            Back to Quizzes
          </Button>
        </div>
      ) : !submitted ? (
        <div className="space-y-5">
          {quiz.questions.map((q, idx) => (
            <div
              key={q.id}
              className="glass-card p-5"
              data-ocid={`quiz_attempt.question.item.${idx + 1}`}
            >
              <p className="font-semibold text-white text-sm mb-4">
                {idx + 1}. {q.questionText}
              </p>
              <RadioGroup
                value={answers[q.id] !== undefined ? String(answers[q.id]) : ""}
                onValueChange={(v) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: Number(v) }))
                }
              >
                {q.options.map((opt, oIdx) => (
                  <div
                    key={`opt-${q.id}-${oIdx}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <RadioGroupItem
                      value={String(oIdx)}
                      id={`${q.id}-${oIdx}`}
                      data-ocid="quiz_attempt.radio"
                    />
                    <Label
                      htmlFor={`${q.id}-${oIdx}`}
                      className="text-sm text-white/80 cursor-pointer"
                    >
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < quiz.questions.length}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0"
            data-ocid="quiz_attempt.submit_button"
          >
            Submit Quiz
          </Button>
        </div>
      ) : (
        <div
          className="glass-card p-8 text-center"
          data-ocid="quiz_attempt.success_state"
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              pct >= 70 ? "bg-green-500/20" : "bg-red-500/20"
            }`}
          >
            {pct >= 70 ? (
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {score} / {quiz.questions.length}
          </h2>
          <p className="text-3xl font-bold text-purple-300 mb-2">{pct}%</p>
          <p className="text-white/60 mb-6">
            {pct >= 70
              ? "Great job! You passed the quiz."
              : "Keep practicing! You can do better."}
          </p>

          {/* Answer Review */}
          <div className="text-left space-y-3 mb-6">
            {quiz.questions.map((q, idx) => {
              const isCorrect = answers[q.id] === q.correctAnswer;
              return (
                <div
                  key={q.id}
                  className={`border rounded-lg p-3 text-sm ${
                    isCorrect
                      ? "border-green-400/30 bg-green-500/10 text-green-300"
                      : "border-red-400/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  <p className="font-medium mb-1">
                    {idx + 1}. {q.questionText}
                  </p>
                  <p className="text-xs opacity-80">
                    Your answer: {q.options[answers[q.id]] ?? "—"}
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-green-400 mt-0.5">
                      Correct: {q.options[q.correctAnswer]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0"
            data-ocid="quiz_attempt.primary_button"
          >
            Back to Quizzes
          </Button>
        </div>
      )}
    </div>
  );
}
