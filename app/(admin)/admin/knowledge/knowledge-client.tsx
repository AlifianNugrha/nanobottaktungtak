'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createKnowledgeDoc, deleteKnowledgeDoc } from '@/app/actions/knowledge-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileText, Search, BookOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface KnowledgeDoc {
    id: string;
    title: string;
    content: string;
    fileType: string;
    createdAt: Date;
    agent: { name: string };
}

interface Agent {
    id: string;
    name: string;
}

export function KnowledgeClient({ initialDocs, agents, userId }: { initialDocs: any[], agents: any[], userId: string }) {
    const router = useRouter();
    const [docs, setDocs] = useState<KnowledgeDoc[]>(initialDocs);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [agentId, setAgentId] = useState('');

    const filteredDocs = docs.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    async function handleCreate() {
        if (!title || !content || !agentId) {
            toast.error('Mohon lengkapi semua field');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('agentId', agentId);
        formData.append('fileType', 'text');

        const result = await createKnowledgeDoc(formData);

        if (result.success) {
            toast.success('Dokumen berhasil ditambahkan!');
            setTitle('');
            setContent('');
            setAgentId('');
            setIsDialogOpen(false);
            router.refresh();
        } else {
            toast.error('Gagal menambahkan dokumen: ' + result.error);
        }
        setIsLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;

        const result = await deleteKnowledgeDoc(id);
        if (result.success) {
            toast.success('Dokumen dihapus');
            router.refresh(); // Refresh server data
            setDocs(docs.filter(d => d.id !== id)); // Optimistic update
        } else {
            toast.error('Gagal menghapus dokumen');
        }
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari dokumen..."
                        className="pl-9 bg-slate-50 border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto bg-[#1E90FF] hover:bg-[#187bcd] text-white gap-2 shadow-lg shadow-blue-500/20">
                            <Plus className="h-4 w-4" />
                            Tambah Dokumen
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Tambah Knowledge Baru</DialogTitle>
                            <DialogDescription>
                                Masukkan teks atau instruksi khusus yang akan dipelajari oleh Agent.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Judul Dokumen</label>
                                <Input
                                    placeholder="Contoh: Daftar Harga 2024"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Pilih Agent</label>
                                <Select onValueChange={setAgentId} value={agentId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Agent..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents.map(agent => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Konten / Isi Dokumen</label>
                                <Textarea
                                    placeholder="Paste isi dokumen di sini..."
                                    className="h-[200px]"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <p className="text-xs text-slate-500">
                                    *Untuk saat ini support Text Copy-Paste. Upload PDF akan segera hadir.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                            <Button onClick={handleCreate} disabled={isLoading} className="bg-[#1E90FF] text-white">
                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Empty State */}
            {filteredDocs.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Belum ada dokumen</h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                        Tambahkan dokumen agar Agent Anda menjadi lebih pintar dan memahami konteks bisnis Anda.
                    </p>
                </div>
            )}

            {/* Grid List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocs.map((doc) => (
                    <Card key={doc.id} className="group hover:shadow-md transition-all border-slate-200">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <FileText className="h-5 w-5 text-[#1E90FF]" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                                            {doc.title}
                                        </CardTitle>
                                        <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                                            Created for: <span className="text-[#1E90FF] bg-blue-50 px-1.5 py-0.5 rounded">{doc.agent.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                            <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                                {doc.content}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(doc.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
