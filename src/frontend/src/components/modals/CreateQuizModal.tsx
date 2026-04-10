import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAppData } from "../../context/AppContext";
import type { QuizQuestion } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const emptyQuestion = (): QuizQuestion => ({
  id: `q_${Date.now()}_${Math.random()}`,
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
});

export default function CreateQuizModal({ open, onClose }: Props) {
  const { addQuiz, data } = useAppData();
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);

  const updateQuestion = (idx: number, updates: Partial<QuizQuestion>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...updates } : q)),
    );
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) }
          : q,
      ),
    );
  };

  const addQuestion = () => {
    if (questions.length < 5)
      setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length > 1)
      setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const selectedCourseId = courseId || (data.courses[0]?.id ?? "1");
    await addQuiz({
      title,
      courseId: selectedCourseId,
      questions,
    });
    setTitle("");
    setCourseId("");
    setQuestions([emptyQuestion()]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="create_quiz.dialog"
      >
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Quiz Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quiz title"
                className="mt-1"
                data-ocid="create_quiz.input"
              />
            </div>
            <div>
              <Label className="text-sm">Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="mt-1" data-ocid="create_quiz.select">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {data.courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Question {qIdx + 1}</p>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="text-destructive hover:opacity-80"
                      data-ocid={`create_quiz.delete_button.${qIdx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Input
                  value={q.questionText}
                  onChange={(e) =>
                    updateQuestion(qIdx, { questionText: e.target.value })
                  }
                  placeholder="Enter question text"
                  data-ocid="create_quiz.input"
                />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Options (select correct answer)
                  </p>
                  <RadioGroup
                    value={String(q.correctAnswer)}
                    onValueChange={(v) =>
                      updateQuestion(qIdx, { correctAnswer: Number(v) })
                    }
                  >
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={opt || String(oIdx)}
                        className="flex items-center gap-2"
                      >
                        <RadioGroupItem
                          value={String(oIdx)}
                          id={`${q.id}-opt${oIdx}`}
                          data-ocid="create_quiz.radio"
                        />
                        <Input
                          value={opt}
                          onChange={(e) =>
                            updateOption(qIdx, oIdx, e.target.value)
                          }
                          placeholder={`Option ${oIdx + 1}`}
                          className="h-8 text-sm"
                          data-ocid="create_quiz.input"
                        />
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>

          {questions.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQuestion}
              data-ocid="create_quiz.secondary_button"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Question
            </Button>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="create_quiz.cancel_button"
            >
              Cancel
            </Button>
            <Button type="submit" data-ocid="create_quiz.submit_button">
              Create Quiz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
