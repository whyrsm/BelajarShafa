'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Topic, getTopicsByCourse, createTopic, updateTopic, deleteTopic } from '@/lib/api/topics';
import { Material, getMaterialsByTopic, createMaterial, deleteMaterial, MaterialType } from '@/lib/api/materials';
import { Plus, ChevronDown, ChevronUp, GripVertical, Trash2, Edit2, X, Check, Video, FileText, Link as LinkIcon, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface CurriculumBuilderProps {
  courseId: string;
}

export function CurriculumBuilder({ courseId }: CurriculumBuilderProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editingTopicData, setEditingTopicData] = useState<{ title: string; description: string }>({ title: '', description: '' });
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicData, setNewTopicData] = useState({ title: '', description: '' });
  const [materials, setMaterials] = useState<Record<string, Material[]>>({});
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
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

  useEffect(() => {
    loadTopics();
  }, [courseId]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const topicsData = await getTopicsByCourse(courseId);
      setTopics(topicsData);
      
      // Load materials for each topic
      const materialsMap: Record<string, Material[]> = {};
      for (const topic of topicsData) {
        const materialsData = await getMaterialsByTopic(topic.id);
        materialsMap[topic.id] = materialsData;
      }
      setMaterials(materialsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
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

  const openMaterialDialog = (topicId: string) => {
    setSelectedTopicId(topicId);
    setNewMaterial({
      type: MaterialType.VIDEO,
      title: '',
      content: { videoUrl: '' },
    });
    setIsMaterialDialogOpen(true);
  };

  const handleAddMaterial = async () => {
    if (!selectedTopicId || !newMaterial.title.trim()) {
      setError('Judul materi tidak boleh kosong');
      return;
    }

    // Validate content based on type
    if (newMaterial.type === MaterialType.VIDEO && !newMaterial.content.videoUrl) {
      setError('URL video tidak boleh kosong');
      return;
    }

    try {
      await createMaterial({
        topicId: selectedTopicId,
        type: newMaterial.type,
        title: newMaterial.title,
        content: newMaterial.content,
      });
      setIsMaterialDialogOpen(false);
      await loadTopics(); // Reload to get updated materials
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan materi');
    }
  };

  const handleDeleteMaterial = async (materialId: string, topicId: string) => {
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

      {/* Topics List */}
      <div className="space-y-3">
        {topics.map((topic) => {
          const isExpanded = expandedTopics.has(topic.id);
          const isEditing = editingTopic === topic.id;
          const topicMaterials = materials[topic.id] || [];

          return (
            <Card key={topic.id} className={isExpanded ? 'border-primary border-2' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className="mt-1 p-1 hover:bg-muted rounded"
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                  </button>

                  {isEditing ? (
                    <div className="flex-1 space-y-3">
                      <Input
                        value={editingTopicData.title}
                        onChange={(e) => setEditingTopicData({ ...editingTopicData, title: e.target.value })}
                        placeholder="Judul topik"
                        className="font-semibold"
                      />
                      <textarea
                        value={editingTopicData.description}
                        onChange={(e) => setEditingTopicData({ ...editingTopicData, description: e.target.value })}
                        placeholder="Deskripsi topik (opsional)"
                        className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveTopic(topic.id)}
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditTopic}
                          className="flex-1"
                        >
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
                        {topicMaterials.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {topicMaterials.length} materi
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditTopic(topic)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTopic(topic.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleTopic(topic.id)}
                        >
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
                        onClick={() => {
                          setNewMaterial({ type: MaterialType.VIDEO, title: '', content: { videoUrl: '' } });
                          openMaterialDialog(topic.id);
                        }}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        + Lesson
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewMaterial({ type: MaterialType.DOCUMENT, title: '', content: { documentUrl: '' } });
                          openMaterialDialog(topic.id);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        + Document
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewMaterial({ type: MaterialType.ARTICLE, title: '', content: { articleContent: '' } });
                          openMaterialDialog(topic.id);
                        }}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        + Article
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewMaterial({ type: MaterialType.EXTERNAL_LINK, title: '', content: { externalUrl: '' } });
                          openMaterialDialog(topic.id);
                        }}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        + Link
                      </Button>
                    </div>

                    {/* Materials List */}
                    {topicMaterials.length > 0 && (
                      <div className="space-y-2 border-t pt-3">
                        {topicMaterials.map((material) => (
                          <div
                            key={material.id}
                            className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50"
                          >
                            {getMaterialIcon(material.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{material.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {material.type} • Urutan: {material.sequence}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMaterial(material.id, topic.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

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
        <Button
          onClick={() => setIsAddingTopic(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Topik
        </Button>
      )}

      {/* Material Dialog */}
      <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Materi</DialogTitle>
            <DialogDescription>
              Tambahkan materi baru ke topik ini
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
                    content: type === MaterialType.VIDEO ? { videoUrl: '' } :
                             type === MaterialType.DOCUMENT ? { documentUrl: '' } :
                             type === MaterialType.ARTICLE ? { articleContent: '' } :
                             { externalUrl: '' },
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
                  onChange={(e) => setNewMaterial({
                    ...newMaterial,
                    content: { videoUrl: e.target.value },
                  })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}
            {newMaterial.type === MaterialType.DOCUMENT && (
              <div className="space-y-2">
                <Label>URL Dokumen *</Label>
                <Input
                  value={newMaterial.content.documentUrl || ''}
                  onChange={(e) => setNewMaterial({
                    ...newMaterial,
                    content: { documentUrl: e.target.value },
                  })}
                  placeholder="URL dokumen"
                />
              </div>
            )}
            {newMaterial.type === MaterialType.ARTICLE && (
              <div className="space-y-2">
                <Label>Konten Artikel *</Label>
                <textarea
                  value={newMaterial.content.articleContent || ''}
                  onChange={(e) => setNewMaterial({
                    ...newMaterial,
                    content: { articleContent: e.target.value },
                  })}
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
                  onChange={(e) => setNewMaterial({
                    ...newMaterial,
                    content: { externalUrl: e.target.value },
                  })}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaterialDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddMaterial}>
              Tambah Materi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

