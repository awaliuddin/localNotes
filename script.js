// ==================== Application State ====================
class NotesApp {
    constructor() {
        this.notes = [];
        this.currentNoteId = null;
        this.currentFilter = 'all';
        this.currentSort = 'modified';
        this.autoSaveTimeout = null;
        this.init();
    }

    init() {
        this.loadNotes();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.renderNotesList();
        this.updateStats();
        this.loadTheme();
    }

    // ==================== Data Management ====================
    loadNotes() {
        const stored = localStorage.getItem('localNotes');
        this.notes = stored ? JSON.parse(stored) : [];
    }

    saveNotes() {
        localStorage.setItem('localNotes', JSON.stringify(this.notes));
        this.updateStats();
    }

    createNote() {
        const note = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            tags: [],
            color: '',
            pinned: false,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        };
        this.notes.unshift(note);
        this.saveNotes();
        this.renderNotesList();
        this.selectNote(note.id);

        // Focus on title input
        setTimeout(() => {
            document.getElementById('noteTitle').focus();
            document.getElementById('noteTitle').select();
        }, 100);
    }

    deleteNote(id) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
        this.renderNotesList();

        if (this.currentNoteId === id) {
            this.currentNoteId = null;
            this.showNoNoteSelected();
        }
    }

    updateNote(id, updates) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            Object.assign(note, updates);
            note.modifiedAt = new Date().toISOString();
            this.saveNotes();
            this.renderNotesList();
        }
    }

    togglePin(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.pinned = !note.pinned;
            this.saveNotes();
            this.renderNotesList();
            this.updatePinButton();
        }
    }

    // ==================== UI Rendering ====================
    renderNotesList() {
        const notesList = document.getElementById('notesList');
        let filteredNotes = this.getFilteredNotes();

        if (filteredNotes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>No notes found</h3>
                    <p>Try adjusting your filters or create a new note</p>
                </div>
            `;
            return;
        }

        notesList.innerHTML = filteredNotes.map(note => this.createNoteCard(note)).join('');
        this.updateNoteCount(filteredNotes.length);

        // Reapply active state
        if (this.currentNoteId) {
            const activeCard = notesList.querySelector(`[data-id="${this.currentNoteId}"]`);
            if (activeCard) activeCard.classList.add('active');
        }
    }

    createNoteCard(note) {
        const preview = this.stripMarkdown(note.content).substring(0, 150);
        const date = this.formatDate(note.modifiedAt);
        const colorClass = note.color ? `color-${note.color}` : '';
        const pinnedClass = note.pinned ? 'pinned' : '';

        return `
            <div class="note-card ${colorClass} ${pinnedClass}" data-id="${note.id}">
                <div class="note-card-header">
                    <div>
                        <div class="note-card-title">${this.escapeHtml(note.title)}</div>
                        <div class="note-card-date">${date}</div>
                    </div>
                </div>
                ${preview ? `<div class="note-card-preview">${this.escapeHtml(preview)}</div>` : ''}
                ${note.tags.length > 0 ? `
                    <div class="note-card-tags">
                        ${note.tags.map(tag => `<span class="note-card-tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    selectNote(id) {
        this.currentNoteId = id;
        const note = this.notes.find(n => n.id === id);

        if (!note) return;

        // Update UI
        document.getElementById('noNoteSelected').style.display = 'none';
        document.getElementById('noteEditor').style.display = 'flex';

        // Populate fields
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
        document.getElementById('colorSelect').value = note.color || '';

        // Render tags
        this.renderNoteTags(note.tags);

        // Update active state in list
        document.querySelectorAll('.note-card').forEach(card => {
            card.classList.toggle('active', card.dataset.id === id);
        });

        // Update preview
        this.updatePreview();
        this.updateWordCount();
        this.updatePinButton();
        this.updateLastSaved();
    }

    showNoNoteSelected() {
        document.getElementById('noNoteSelected').style.display = 'flex';
        document.getElementById('noteEditor').style.display = 'none';
    }

    renderNoteTags(tags) {
        const container = document.getElementById('noteTags');
        container.innerHTML = tags.map(tag => `
            <span class="note-tag">
                ${this.escapeHtml(tag)}
                <span class="remove-tag" data-tag="${this.escapeHtml(tag)}">×</span>
            </span>
        `).join('');
    }

    updateStats() {
        document.getElementById('totalNotes').textContent = this.notes.length;

        const allTags = new Set();
        this.notes.forEach(note => note.tags.forEach(tag => allTags.add(tag)));
        document.getElementById('totalTags').textContent = allTags.size;

        this.renderTagFilters();
    }

    renderTagFilters() {
        const container = document.getElementById('tagFilter');
        const allTags = new Set();
        this.notes.forEach(note => note.tags.forEach(tag => allTags.add(tag)));

        let html = '<button class="tag-filter-btn active" data-tag="all">All Notes</button>';

        if (allTags.size > 0) {
            html += Array.from(allTags)
                .sort()
                .map(tag => `<button class="tag-filter-btn" data-tag="${this.escapeHtml(tag)}">${this.escapeHtml(tag)}</button>`)
                .join('');
        }

        container.innerHTML = html;
    }

    updateNoteCount(count) {
        document.getElementById('noteCount').textContent = `${count} note${count !== 1 ? 's' : ''}`;
    }

    updatePinButton() {
        const note = this.notes.find(n => n.id === this.currentNoteId);
        const pinBtn = document.getElementById('pinBtn');
        if (note && pinBtn) {
            pinBtn.style.opacity = note.pinned ? '1' : '0.5';
        }
    }

    updateLastSaved() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        document.getElementById('lastSaved').textContent = `Saved at ${timeStr}`;
    }

    // ==================== Filtering and Sorting ====================
    getFilteredNotes() {
        let filtered = [...this.notes];

        // Filter by tag
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(note => note.tags.includes(this.currentFilter));
        }

        // Search filter
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(searchTerm) ||
                note.content.toLowerCase().includes(searchTerm) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Sort
        filtered.sort((a, b) => {
            // Pinned notes always first
            if (a.pinned !== b.pinned) return b.pinned - a.pinned;

            switch (this.currentSort) {
                case 'modified':
                    return new Date(b.modifiedAt) - new Date(a.modifiedAt);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'color':
                    return (a.color || '').localeCompare(b.color || '');
                default:
                    return 0;
            }
        });

        return filtered;
    }

    // ==================== Markdown ====================
    updatePreview() {
        const content = document.getElementById('noteContent').value;
        const preview = document.getElementById('markdownPreview');
        preview.innerHTML = this.renderMarkdown(content);
    }

    renderMarkdown(text) {
        let html = this.escapeHtml(text);

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold and italic
        html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // Code blocks
        html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Lists
        html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Todo items
        html = html.replace(/\[ \] (.*$)/gim, '<div class="todo-item">☐ $1</div>');
        html = html.replace(/\[x\] (.*$)/gim, '<div class="todo-item">☑ $1</div>');

        // Blockquotes
        html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    stripMarkdown(text) {
        return text
            .replace(/[#*`>\[\]]/g, '')
            .replace(/\n/g, ' ')
            .trim();
    }

    // ==================== Word Count ====================
    updateWordCount() {
        const content = document.getElementById('noteContent').value;
        const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = content.length;

        document.getElementById('wordCount').textContent = `${words} word${words !== 1 ? 's' : ''}`;
        document.getElementById('charCount').textContent = `${chars} character${chars !== 1 ? 's' : ''}`;
    }

    // ==================== Auto-save ====================
    scheduleAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => {
            this.saveCurrentNote();
        }, 1000); // Auto-save after 1 second of inactivity
    }

    saveCurrentNote() {
        if (!this.currentNoteId) return;

        const title = document.getElementById('noteTitle').value || 'Untitled Note';
        const content = document.getElementById('noteContent').value;
        const color = document.getElementById('colorSelect').value;

        this.updateNote(this.currentNoteId, { title, content, color });
        this.updateLastSaved();
    }

    // ==================== Tags ====================
    addTag(tag) {
        if (!this.currentNoteId || !tag.trim()) return;

        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note && !note.tags.includes(tag.trim())) {
            note.tags.push(tag.trim());
            this.saveNotes();
            this.renderNoteTags(note.tags);
        }
    }

    removeTag(tag) {
        if (!this.currentNoteId) return;

        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note) {
            note.tags = note.tags.filter(t => t !== tag);
            this.saveNotes();
            this.renderNoteTags(note.tags);
        }
    }

    // ==================== Import/Export ====================
    exportNotes() {
        const dataStr = JSON.stringify(this.notes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `localnotes-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    importNotes(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    if (confirm(`Import ${imported.length} notes? This will merge with existing notes.`)) {
                        this.notes = [...this.notes, ...imported];
                        this.saveNotes();
                        this.renderNotesList();
                        alert('Notes imported successfully!');
                    }
                }
            } catch (error) {
                alert('Error importing notes. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    // ==================== Theme ====================
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update icon
        document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    loadTheme() {
        const saved = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        document.getElementById('themeToggle').textContent = saved === 'dark' ? '☀️' : '🌙';
    }

    // ==================== Event Listeners ====================
    setupEventListeners() {
        // New note
        document.getElementById('newNoteBtn').addEventListener('click', () => this.createNote());

        // Save note
        document.getElementById('saveBtn').addEventListener('click', () => this.saveCurrentNote());

        // Delete note
        document.getElementById('deleteBtn').addEventListener('click', () => {
            if (this.currentNoteId) {
                this.deleteNote(this.currentNoteId);
            }
        });

        // Pin note
        document.getElementById('pinBtn').addEventListener('click', () => {
            if (this.currentNoteId) {
                this.togglePin(this.currentNoteId);
            }
        });

        // Note selection
        document.getElementById('notesList').addEventListener('click', (e) => {
            const card = e.target.closest('.note-card');
            if (card) {
                this.selectNote(card.dataset.id);
            }
        });

        // Title and content changes
        document.getElementById('noteTitle').addEventListener('input', () => this.scheduleAutoSave());
        document.getElementById('noteContent').addEventListener('input', () => {
            this.scheduleAutoSave();
            this.updatePreview();
            this.updateWordCount();
        });

        // Color change
        document.getElementById('colorSelect').addEventListener('change', () => this.scheduleAutoSave());

        // Tag input
        document.getElementById('tagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag(e.target.value);
                e.target.value = '';
            }
        });

        // Tag removal
        document.getElementById('noteTags').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-tag')) {
                this.removeTag(e.target.dataset.tag);
            }
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', () => {
            this.renderNotesList();
        });

        // Tag filter
        document.getElementById('tagFilter').addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-filter-btn')) {
                document.querySelectorAll('.tag-filter-btn').forEach(btn =>
                    btn.classList.remove('active')
                );
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.tag;
                this.renderNotesList();

                const title = this.currentFilter === 'all' ? 'All Notes' : `#${this.currentFilter}`;
                document.getElementById('sectionTitle').textContent = title;
            }
        });

        // Sort
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderNotesList();
        });

        // Editor tabs
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const mode = e.target.dataset.tab;

                document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                const editorContent = document.querySelector('.editor-content');
                const writPane = document.querySelector('.write-pane');
                const previewPane = document.querySelector('.preview-pane');

                writPane.classList.remove('active');
                previewPane.classList.remove('active');
                editorContent.classList.remove('split-view');

                if (mode === 'write') {
                    writPane.classList.add('active');
                } else if (mode === 'preview') {
                    previewPane.classList.add('active');
                    this.updatePreview();
                } else if (mode === 'split') {
                    editorContent.classList.add('split-view');
                    this.updatePreview();
                }
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportNotes());

        // Import
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importModal').classList.add('active');
        });

        document.getElementById('confirmImport').addEventListener('click', () => {
            const fileInput = document.getElementById('importFile');
            if (fileInput.files.length > 0) {
                this.importNotes(fileInput.files[0]);
                document.getElementById('importModal').classList.remove('active');
                fileInput.value = '';
            }
        });

        document.getElementById('cancelImport').addEventListener('click', () => {
            document.getElementById('importModal').classList.remove('active');
            document.getElementById('importFile').value = '';
        });
    }

    // ==================== Keyboard Shortcuts ====================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: New note
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.createNote();
            }

            // Ctrl/Cmd + S: Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveCurrentNote();
            }

            // Ctrl/Cmd + F: Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }

            // Ctrl/Cmd + D: Delete
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                if (this.currentNoteId) {
                    this.deleteNote(this.currentNoteId);
                }
            }
        });
    }

    // ==================== Utility Functions ====================
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ==================== Initialize App ====================
const app = new NotesApp();
