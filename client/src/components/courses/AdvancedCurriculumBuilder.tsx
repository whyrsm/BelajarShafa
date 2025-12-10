'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Topic,
  getTopicsByCourse,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
  duplicateTopic,
} from '@/lib/api/topics';
import {
  Material,
  getMaterialsByTopic,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  reorderMaterials,
  MaterialType,
} from '@/lib/api/materials';
import {
  Plus,
  GripVertical,
  Trash2,
  Edit2,
  X,
  Check,
  Video,
  FileText,
  Link as LinkIcon,
  BookOpen,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useWizardContext } from './CourseManagementWizard';

interface AdvancedCurriculumBuilderProps {
  courseId: string;
}

interface SortableTopicItemProps {
  topic: Topic;
  materials: Material[];
  isExpanded: boolean;
  isEditing: boolean;
  editingData: { title: string; description: string };
  onToggle: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEditDataChange: (data: { title: string; description: string }) => void;
  onAddMaterial: (type: MaterialType) => void;
  onEditMaterial: (material: Material) => void;
  onDeleteMaterial: (materialId: string) => void;
  onMaterialDragEnd: (event: DragEndEvent, topicId: string) => void;
}

function SortableTopicItem({
  topic,
  materials,
  isExpanded,
  isEditing,
  editingData,
  onToggle,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onDuplicate,
  onEditDataChange,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onMaterialDragEnd,
}: SortableTopicItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const materialSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const materialIds = materials.map((m) => m.id);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={isExpanded ? 'border-primary border-2' : ''}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </button>

          {isEditing ? (
            <div className="flex-1 space-y-3">
              <Input
                value={editingData.title}
                onChange={(e) =>
                  onEditDataChange({ ...editingData, title: e.target.value })
                }
                placeholder="Judul topik"
                className="font-semibold"
              />
              <textarea
                value={editingData.description}
                onChange={(e) =>
                  onEditDataChange({ ...editingData, description: e.target.value })
                }
                placeholder="Deskripsi topik (opsional)"
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={onSave} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
                <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">
                    {topic.sequence}. {topic.title}
                  </CardTitle>
                  {topic.isMandatory && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Wajib
                    </span>
                  )}
                </div>
                {topic.description && (
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                )}
                {materials.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {materials.length} materi
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={onEdit}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onDuplicate}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onDelete}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onToggle}>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      {isExpanded && !isEditing && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Material Type Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddMaterial(MaterialType.VIDEO)}
              >
                <Video className="w-4 h-4 mr-2" />
                + Video
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddMaterial(MaterialType.DOCUMENT)}
              >
                <FileText className="w-4 h-4 mr-2" />
                + Dokumen
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddMaterial(MaterialType.ARTICLE)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                + Artikel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddMaterial(MaterialType.EXTERNAL_LINK)}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                + Link
              </Button>
            </div>

            {/* Materials List with Drag and Drop */}
            {materials.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <DndContext
                  sensors={materialSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => onMaterialDragEnd(event, topic.id)}
                >
                  <SortableContext
                    items={materialIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {materials.map((material) => (
                      <SortableMaterialItem
                        key={material.id}
                        material={material}
                        onEdit={() => onEditMaterial(material)}
                        onDelete={() => onDeleteMaterial(material.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface SortableMaterialItemProps {
  material: Material;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableMaterialItem({ material, onEdit, onDelete }: SortableMaterialItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: material.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getMaterialIcon = (type: MaterialType) => {
    switch (type) {
      case MaterialType.VIDEO:
        return <Video className="w-4 h-4" />;
      case MaterialType.DOCUMENT:
        return <FileText className="w-4 h-4" />;
      case MaterialType.ARTICLE:
        return <BookOpen className="w-4 h-4" />;
      case MaterialType.EXTERNAL_LINK:
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50"
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      {getMaterialIcon(material.type)}
      <div className="flex-1">
        <p className="text-sm font-medium">{material.title}</p>
        <p className="text-xs text-muted-foreground">
          {material.type} • Urutan: {material.sequence}
        </p>
      </div>
      <Button size="sm" variant="ghost" onClick={onEdit}>
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onDelete}>
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
}

export function AdvancedCurriculumBuilder({ courseId }: AdvancedCurriculumBuilderProps) {
  const { topics: wizardTopics, materials: wizardMaterials, setTopics, setMaterials } = useWizardContext();
  const [topics, setTopicsState] = useState<Topic[]>(wizardTopics);
  const [materials, setMaterialsState] = useState<Record<string, Material[]>>(wizardMaterials);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editingTopicData, setEditingTopicData] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  });
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicData, setNewTopicData] = useState({ title: '', description: '' });
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [newMaterial, setNewMaterial] = useState<{
    type: MaterialType;
    title: string;
    content: {
      videoUrl?: string;
      documentUrl?: string;
      fileName?: string;
      fileSize?: number;
      articleContent?: string;
      externalUrl?: string;
    };
  }>({
    type: MaterialType.VIDEO,
    title: '',
    content: { videoUrl: '' },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTopics();
  }, [courseId]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const topicsData = await getTopicsByCourse(courseId);
      setTopicsState(topicsData);

      // Load materials for each topic
      const materialsMap: Record<string, Material[]> = {};
      for (const topic of topicsData) {
        const materialsData = await getMaterialsByTopic(topic.id);
        materialsMap[topic.id] = materialsData;
      }
      setMaterialsState(materialsMap);
      setTopicsState(topicsData);
      // Sync with wizard context
      setTopics(topicsData);
      Object.keys(materialsMap).forEach((topicId) => {
        setMaterials(topicId, materialsMap[topicId]);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = topics.findIndex((t) => t.id === active.id);
      const newIndex = topics.findIndex((t) => t.id === over.id);

      const newTopics = arrayMove(topics, oldIndex, newIndex);
      setTopicsState(newTopics);

      // Update sequences
      const reorderData = newTopics.map((topic, index) => ({
        id: topic.id,
        sequence: index + 1,
      }));

      try {
        await reorderTopics(courseId, { topics: reorderData });
        await loadTopics();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mengurutkan topik');
        await loadTopics(); // Revert on error
      }
    }
  };

  const handleMaterialDragEnd = async (event: DragEndEvent, topicId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const topicMaterials = materials[topicId] || [];
      const oldIndex = topicMaterials.findIndex((m) => m.id === active.id);
      const newIndex = topicMaterials.findIndex((m) => m.id === over.id);

      const newMaterials = arrayMove(topicMaterials, oldIndex, newIndex);
      setMaterialsState((prev) => ({
        ...prev,
        [topicId]: newMaterials,
      }));

      // Update sequences
      const reorderData = newMaterials.map((material, index) => ({
        id: material.id,
        sequence: index + 1,
      }));

      try {
        await reorderMaterials(topicId, { materials: reorderData });
        await loadTopics();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mengurutkan materi');
        await loadTopics(); // Revert on error
      }
    }
  };

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
      setEditingTopic(null);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const startEditTopic = (topic: Topic) => {
    setEditingTopic(topic.id);
    setEditingTopicData({ title: topic.title, description: topic.description || '' });
  };

  const cancelEditTopic = () => {
    setEditingTopic(null);
    setEditingTopicData({ title: '', description: '' });
  };

  const saveTopic = async (topicId: string) => {
    try {
      await updateTopic(topicId, {
        title: editingTopicData.title,
        description: editingTopicData.description,
      });
      await loadTopics();
      setEditingTopic(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan topik');
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus topik ini? Semua materi dalam topik ini juga akan dihapus.')) {
      return;
    }
    try {
      await deleteTopic(topicId);
      await loadTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus topik');
    }
  };

  const handleDuplicateTopic = async (topicId: string) => {
    try {
      await duplicateTopic(topicId);
      await loadTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menduplikasi topik');
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicData.title.trim()) {
      setError('Judul topik tidak boleh kosong');
      return;
    }
    try {
      await createTopic({
        courseId,
        title: newTopicData.title,
        description: newTopicData.description,
      });
      setNewTopicData({ title: '', description: '' });
      setIsAddingTopic(false);
      await loadTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan topik');
    }
  };

  const openMaterialDialog = (topicId: string, type: MaterialType, material?: Material) => {
    setSelectedTopicId(topicId);
    if (material) {
      setEditingMaterial(material);
      setNewMaterial({
        type: material.type,
        title: material.title,
        content: material.content as any,
      });
    } else {
      setEditingMaterial(null);
      setNewMaterial({
        type,
        title: '',
        content:
          type === MaterialType.VIDEO
            ? { videoUrl: '' }
            : type === MaterialType.DOCUMENT
            ? { documentUrl: '' }
            : type === MaterialType.ARTICLE
            ? { articleContent: '' }
            : { externalUrl: '' },
      });
    }
    setIsMaterialDialogOpen(true);
  };

  const handleSaveMaterial = async () => {
    if (!selectedTopicId || !newMaterial.title.trim()) {
      setError('Judul materi tidak boleh kosong');
      return;
    }

    // Validate content based on type
    if (newMaterial.type === MaterialType.VIDEO && !newMaterial.content.videoUrl) {
      setError('URL video tidak boleh kosong');
      return;
    }
    if (newMaterial.type === MaterialType.DOCUMENT && !newMaterial.content.documentUrl) {
      setError('URL dokumen tidak boleh kosong');
      return;
    }
    if (newMaterial.type === MaterialType.ARTICLE && !newMaterial.content.articleContent) {
      setError('Konten artikel tidak boleh kosong');
      return;
    }
    if (newMaterial.type === MaterialType.EXTERNAL_LINK && !newMaterial.content.externalUrl) {
      setError('URL eksternal tidak boleh kosong');
      return;
    }

    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, {
          type: newMaterial.type,
          title: newMaterial.title,
          content: newMaterial.content,
        });
      } else {
        await createMaterial({
          topicId: selectedTopicId,
          type: newMaterial.type,
          title: newMaterial.title,
          content: newMaterial.content,
        });
      }
      setIsMaterialDialogOpen(false);
      await loadTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan materi');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
      return;
    }
    try {
      await deleteMaterial(materialId);
      await loadTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus materi');
    }
  };

  const topicIds = topics.map((t) => t.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat kurikulum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Topics List with Drag and Drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTopicDragEnd}>
        <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {topics.map((topic) => (
              <SortableTopicItem
                key={topic.id}
                topic={topic}
                materials={materials[topic.id] || []}
                isExpanded={expandedTopics.has(topic.id)}
                isEditing={editingTopic === topic.id}
                editingData={editingTopicData}
                onToggle={() => toggleTopic(topic.id)}
                onEdit={() => startEditTopic(topic)}
                onSave={() => saveTopic(topic.id)}
                onCancel={cancelEditTopic}
                onDelete={() => handleDeleteTopic(topic.id)}
                onDuplicate={() => handleDuplicateTopic(topic.id)}
                onEditDataChange={setEditingTopicData}
                onAddMaterial={(type) => openMaterialDialog(topic.id, type)}
                onEditMaterial={(material) => openMaterialDialog(topic.id, material.type, material)}
                onDeleteMaterial={handleDeleteMaterial}
                onMaterialDragEnd={(event) => handleMaterialDragEnd(event, topic.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Topic Section */}
      {isAddingTopic ? (
        <Card className="border-primary border-2">
          <CardHeader>
            <CardTitle className="text-lg">Topik Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Judul Topik *</Label>
              <Input
                value={newTopicData.title}
                onChange={(e) => setNewTopicData({ ...newTopicData, title: e.target.value })}
                placeholder="Masukkan judul topik"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <textarea
                value={newTopicData.description}
                onChange={(e) => setNewTopicData({ ...newTopicData, description: e.target.value })}
                placeholder="Deskripsi topik (opsional)"
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTopic} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Simpan
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingTopic(false);
                  setNewTopicData({ title: '', description: '' });
                }}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAddingTopic(true)} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Topik
        </Button>
      )}

      {/* Material Dialog */}
      <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Edit Materi' : 'Tambah Materi'}</DialogTitle>
            <DialogDescription>
              {editingMaterial ? 'Edit materi pembelajaran' : 'Tambahkan materi baru ke topik ini'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipe Materi</Label>
              <select
                value={newMaterial.type}
                onChange={(e) => {
                  const type = e.target.value as MaterialType;
                  setNewMaterial({
                    type,
                    title: newMaterial.title,
                    content:
                      type === MaterialType.VIDEO
                        ? { videoUrl: '' }
                        : type === MaterialType.DOCUMENT
                        ? { documentUrl: '' }
                        : type === MaterialType.ARTICLE
                        ? { articleContent: '' }
                        : { externalUrl: '' },
                  });
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value={MaterialType.VIDEO}>Video (YouTube)</option>
                <option value={MaterialType.DOCUMENT}>Dokumen</option>
                <option value={MaterialType.ARTICLE}>Artikel</option>
                <option value={MaterialType.EXTERNAL_LINK}>Link Eksternal</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Judul Materi *</Label>
              <Input
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                placeholder="Masukkan judul materi"
              />
            </div>
            {newMaterial.type === MaterialType.VIDEO && (
              <div className="space-y-2">
                <Label>URL YouTube *</Label>
                <Input
                  value={newMaterial.content.videoUrl || ''}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      content: { videoUrl: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}
            {newMaterial.type === MaterialType.DOCUMENT && (
              <div className="space-y-2">
                <Label>URL Dokumen *</Label>
                <Input
                  value={newMaterial.content.documentUrl || ''}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      content: { documentUrl: e.target.value },
                    })
                  }
                  placeholder="URL dokumen"
                />
              </div>
            )}
            {newMaterial.type === MaterialType.ARTICLE && (
              <div className="space-y-2">
                <Label>Konten Artikel *</Label>
                <textarea
                  value={newMaterial.content.articleContent || ''}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      content: { articleContent: e.target.value },
                    })
                  }
                  placeholder="Konten artikel..."
                  className="w-full min-h-[150px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                />
              </div>
            )}
            {newMaterial.type === MaterialType.EXTERNAL_LINK && (
              <div className="space-y-2">
                <Label>URL Eksternal *</Label>
                <Input
                  value={newMaterial.content.externalUrl || ''}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      content: { externalUrl: e.target.value },
                    })
                  }
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaterialDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveMaterial}>
              {editingMaterial ? 'Simpan Perubahan' : 'Tambah Materi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
