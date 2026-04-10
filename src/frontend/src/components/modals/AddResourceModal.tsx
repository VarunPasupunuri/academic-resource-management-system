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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAppData } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddResourceModal({ open, onClose }: Props) {
  const { addResource, data } = useAppData();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"pdf" | "video" | "doc">("pdf");
  const [courseId, setCourseId] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const selectedCourseId = courseId || (data.courses[0]?.id ?? "1");
    await addResource({
      title,
      type,
      courseId: selectedCourseId,
      url: url || "#",
      uploadedBy: currentUser?.id ?? "1",
    });
    setTitle("");
    setType("pdf");
    setCourseId("");
    setUrl("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="add_resource.dialog">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resource title"
              className="mt-1"
              data-ocid="add_resource.input"
            />
          </div>
          <div>
            <Label className="text-sm">Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger className="mt-1" data-ocid="add_resource.select">
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
          <div>
            <Label className="text-sm">Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as "pdf" | "video" | "doc")}
            >
              <SelectTrigger className="mt-1" data-ocid="add_resource.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="doc">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">URL (optional)</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1"
              data-ocid="add_resource.input"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="add_resource.cancel_button"
            >
              Cancel
            </Button>
            <Button type="submit" data-ocid="add_resource.submit_button">
              Add Resource
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
