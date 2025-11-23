// ==================== Application State ====================
class NotesApp {
    constructor() {
        this.notes = [];
        this.currentNoteId = null;
        this.currentFilter = 'all';
        this.currentQuickFilter = 'all';
        this.currentSort = 'modified';
        this.autoSaveTimeout = null;
        this.undoStack = [];
        this.redoStack = [];
        this.contextMenuNoteId = null;
        this.templates = this.getTemplates();
        this.init();
    }

    init() {
        this.loadNotes();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.renderNotesList();
        this.updateStats();
        this.loadTheme();
        this.showWelcomeIfFirstTime();
        this.updateStorageInfo();
    }

    // ==================== Templates ====================
    getTemplates() {
        return {
            blank: {
                title: 'New Note',
                content: '',
                tags: []
            },
            meeting: {
                title: 'Meeting Notes',
                content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:**
**Topic:**

## Agenda
1.
2.
3.

## Discussion Notes


## Action Items
- [ ]
- [ ]

## Next Steps

`,
                tags: ['meeting']
            },
            todo: {
                title: 'To-Do List',
                content: `# To-Do List

## Today
- [ ]
- [ ]
- [ ]

## This Week
- [ ]
- [ ]

## Later
- [ ]
`,
                tags: ['todo']
            },
            journal: {
                title: `Journal - ${new Date().toLocaleDateString()}`,
                content: `# ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## How I'm Feeling
😊

## What Happened Today


## Grateful For
-
-
-

## Tomorrow's Goals
-
-
`,
                tags: ['journal']
            },
            ideas: {
                title: 'Ideas & Brainstorm',
                content: `# Ideas & Brainstorming

## Main Idea
💡

## Details


## Pros & Cons
**Pros:**
-
-

**Cons:**
-
-

## Next Steps
1.
2.
`,
                tags: ['ideas', 'brainstorm']
            },
            code: {
                title: 'Code Snippet',
                content: `# Code Snippet

**Language:**
**Purpose:**

\`\`\`
// Your code here

\`\`\`

## Notes


## Usage


`,
                tags: ['code', 'dev']
            },
            research: {
                title: 'Research Notes',
                content: `# Research Notes

**Topic:**
**Date:** ${new Date().toLocaleDateString()}

## Overview


## Key Points
-
-
-

## Sources
1.
2.

## Questions
-
-

## Conclusion

`,
                tags: ['research']
            }
        };
    }

    // ==================== Welcome Screen ====================
    showWelcomeIfFirstTime() {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            document.getElementById('welcomeModal').classList.add('active');
        }
    }

    // ==================== Data Management ====================
    loadNotes() {
        const stored = localStorage.getItem('localNotes');
        this.notes = stored ? JSON.parse(stored) : [];

        // Ensure all notes have required fields
        this.notes = this.notes.map(note => ({
            archived: false,
            favorited: false,
            ...note
        }));
    }

    saveNotes() {
        try {
            localStorage.setItem('localNotes', JSON.stringify(this.notes));
            this.updateStats();
            this.updateStorageInfo();
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                this.showToast('Storage quota exceeded! Please delete some notes.', 'error');
            }
        }
    }

    createNote(template = 'blank') {
        const templateData = this.templates[template] || this.templates.blank;
        const note = {
            id: Date.now().toString(),
            title: templateData.title,
            content: templateData.content,
            tags: [...templateData.tags],
            color: '',
            pinned: false,
            favorited: false,
            archived: false,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        };

        this.saveState();
        this.notes.unshift(note);
        this.saveNotes();
        this.renderNotesList();
        this.selectNote(note.id);
        this.showToast('Note created successfully!', 'success');

        // Focus on title input
        setTimeout(() => {
            document.getElementById('noteTitle').focus();
            document.getElementById('noteTitle').select();
        }, 100);
    }

    deleteNote(id) {
        if (!confirm('Are you sure you want to delete this note? This cannot be undone.')) return;

        this.saveState();
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
        this.renderNotesList();

        if (this.currentNoteId === id) {
            this.currentNoteId = null;
            this.showNoNoteSelected();
        }

        this.showToast('Note deleted', 'info');
    }

    duplicateNote(id) {
        const original = this.notes.find(n => n.id === id);
        if (!original) return;

        this.saveState();
        const duplicate = {
            ...JSON.parse(JSON.stringify(original)),
            id: Date.now().toString(),
            title: original.title + ' (Copy)',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            pinned: false
        };

        this.notes.unshift(duplicate);
        this.saveNotes();
        this.renderNotesList();
        this.selectNote(duplicate.id);
        this.showToast('Note duplicated successfully!', 'success');
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
            this.saveState();
            note.pinned = !note.pinned;
            this.saveNotes();
            this.renderNotesList();
            this.updatePinButton();
            this.showToast(note.pinned ? 'Note pinned' : 'Note unpinned', 'info');
        }
    }

    toggleFavorite(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            this.saveState();
            note.favorited = !note.favorited;
            this.saveNotes();
            this.renderNotesList();
            this.updateFavoriteButton();
            this.showToast(note.favorited ? '⭐ Added to favorites' : 'Removed from favorites', 'info');
        }
    }

    toggleArchive(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            this.saveState();
            note.archived = !note.archived;
            this.saveNotes();
            this.renderNotesList();
            this.updateArchiveButton();

            if (note.archived) {
                this.showToast('Note archived', 'info');
                if (this.currentNoteId === id) {
                    this.currentNoteId = null;
                    this.showNoNoteSelected();
                }
            } else {
                this.showToast('Note unarchived', 'info');
            }
        }
    }

    // ==================== Undo/Redo ====================
    saveState() {
        this.undoStack.push(JSON.stringify(this.notes));
        if (this.undoStack.length > 50) this.undoStack.shift();
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.undoStack.length === 0) return;

        this.redoStack.push(JSON.stringify(this.notes));
        const previousState = this.undoStack.pop();
        this.notes = JSON.parse(previousState);
        this.saveNotes();
        this.renderNotesList();
        this.updateUndoRedoButtons();
        this.showToast('Undo successful', 'info');

        if (this.currentNoteId && !this.notes.find(n => n.id === this.currentNoteId)) {
            this.currentNoteId = null;
            this.showNoNoteSelected();
        }
    }

    redo() {
        if (this.redoStack.length === 0) return;

        this.undoStack.push(JSON.stringify(this.notes));
        const nextState = this.redoStack.pop();
        this.notes = JSON.parse(nextState);
        this.saveNotes();
        this.renderNotesList();
        this.updateUndoRedoButtons();
        this.showToast('Redo successful', 'info');
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn) undoBtn.style.opacity = this.undoStack.length > 0 ? '1' : '0.3';
        if (redoBtn) redoBtn.style.opacity = this.redoStack.length > 0 ? '1' : '0.3';
    }

    // ==================== UI Rendering ====================
    renderNotesList() {
        const notesList = document.getElementById('notesList');
        let filteredNotes = this.getFilteredNotes();

        if (filteredNotes.length === 0) {
            const filterText = this.currentQuickFilter === 'all' ? 'notes' : this.currentQuickFilter + ' notes';
            notesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>No ${filterText} found</h3>
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
        const favoritedClass = note.favorited ? 'favorited' : '';
        const archivedClass = note.archived ? 'archived' : '';

        return `
            <div class="note-card ${colorClass} ${pinnedClass} ${favoritedClass} ${archivedClass}"
                 data-id="${note.id}"
                 oncontextmenu="app.showContextMenu(event, '${note.id}'); return false;">
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
        this.updateFavoriteButton();
        this.updateArchiveButton();
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
        const activeNotes = this.notes.filter(n => !n.archived);
        const archivedNotes = this.notes.filter(n => n.archived);

        document.getElementById('totalNotes').textContent = activeNotes.length;
        document.getElementById('totalArchived').textContent = archivedNotes.length;

        const allTags = new Set();
        this.notes.forEach(note => note.tags.forEach(tag => allTags.add(tag)));
        document.getElementById('totalTags').textContent = allTags.size;

        this.renderTagFilters();
    }

    updateStorageInfo() {
        try {
            const data = JSON.stringify(this.notes);
            const bytes = new Blob([data]).size;
            const maxSize = 5 * 1024 * 1024; // Approximate 5MB limit
            const percentage = Math.round((bytes / maxSize) * 100);
            document.getElementById('storageUsed').textContent = percentage + '%';

            if (percentage > 80) {
                document.getElementById('storageUsed').style.color = '#fc8181';
            }
        } catch (e) {
            console.error('Error calculating storage:', e);
        }
    }

    renderTagFilters() {
        const container = document.getElementById('tagFilter');
        const allTags = new Set();
        this.notes.forEach(note => note.tags.forEach(tag => allTags.add(tag)));

        let html = '<button class="tag-filter-btn active" data-tag="all">All Tags</button>';

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

    updateFavoriteButton() {
        const note = this.notes.find(n => n.id === this.currentNoteId);
        const favBtn = document.getElementById('favoriteBtn');
        if (note && favBtn) {
            favBtn.style.opacity = note.favorited ? '1' : '0.5';
        }
    }

    updateArchiveButton() {
        const note = this.notes.find(n => n.id === this.currentNoteId);
        const archiveBtn = document.getElementById('archiveBtn');
        if (note && archiveBtn) {
            archiveBtn.textContent = note.archived ? '📤' : '📦';
            archiveBtn.title = note.archived ? 'Unarchive Note' : 'Archive Note';
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

        // Quick filter (all/favorites/archived)
        if (this.currentQuickFilter === 'favorites') {
            filtered = filtered.filter(note => note.favorited && !note.archived);
        } else if (this.currentQuickFilter === 'archived') {
            filtered = filtered.filter(note => note.archived);
        } else {
            filtered = filtered.filter(note => !note.archived);
        }

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
            // Pinned notes always first (within their filter group)
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

        // Code blocks (must be before inline code)
        html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

        // Headers
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold and italic
        html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        html = html.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
        html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Strikethrough
        html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;">');

        // Todo items
        html = html.replace(/^\- \[ \] (.*$)/gim, '<div class="todo-item">☐ $1</div>');
        html = html.replace(/^\- \[x\] (.*$)/gim, '<div class="todo-item">☑ <del>$1</del></div>');

        // Unordered lists
        html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Ordered lists
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

        // Blockquotes
        html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');

        // Horizontal rule
        html = html.replace(/^---$/gim, '<hr>');
        html = html.replace(/^\*\*\*$/gim, '<hr>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    stripMarkdown(text) {
        return text
            .replace(/[#*`>\[\]!_~\-]/g, '')
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
        }, 1000);
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
            this.saveState();
            note.tags.push(tag.trim());
            this.saveNotes();
            this.renderNoteTags(note.tags);
        }
    }

    removeTag(tag) {
        if (!this.currentNoteId) return;

        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note) {
            this.saveState();
            note.tags = note.tags.filter(t => t !== tag);
            this.saveNotes();
            this.renderNoteTags(note.tags);
        }
    }

    // ==================== Context Menu ====================
    showContextMenu(event, noteId) {
        event.preventDefault();
        this.contextMenuNoteId = noteId;

        const menu = document.getElementById('contextMenu');
        menu.style.display = 'block';
        menu.style.left = event.pageX + 'px';
        menu.style.top = event.pageY + 'px';
    }

    hideContextMenu() {
        document.getElementById('contextMenu').style.display = 'none';
        this.contextMenuNoteId = null;
    }

    // ==================== Toast Notifications ====================
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
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
        this.showToast('Notes exported successfully!', 'success');
    }

    importNotes(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    if (confirm(`Import ${imported.length} notes? This will merge with existing notes.`)) {
                        this.saveState();
                        this.notes = [...this.notes, ...imported];
                        this.saveNotes();
                        this.renderNotesList();
                        this.showToast('Notes imported successfully!', 'success');
                    }
                } else {
                    throw new Error('Invalid format');
                }
            } catch (error) {
                this.showToast('Error importing notes. Please check the file format.', 'error');
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
        document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
        this.showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'info');
    }

    loadTheme() {
        const saved = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        document.getElementById('themeToggle').textContent = saved === 'dark' ? '☀️' : '🌙';
    }

    // ==================== Event Listeners ====================
    setupEventListeners() {
        // Welcome modal
        document.getElementById('getStartedBtn')?.addEventListener('click', () => {
            localStorage.setItem('hasVisited', 'true');
            document.getElementById('welcomeModal').classList.remove('active');
        });

        // New note
        document.getElementById('newNoteBtn').addEventListener('click', () => this.createNote());

        // Template selection
        document.getElementById('templateSelect').addEventListener('change', (e) => {
            if (e.target.value) {
                this.createNote(e.target.value);
                e.target.value = '';
            }
        });

        // Save note
        document.getElementById('saveBtn').addEventListener('click', () => this.saveCurrentNote());

        // Delete note
        document.getElementById('deleteBtn').addEventListener('click', () => {
            if (this.currentNoteId) this.deleteNote(this.currentNoteId);
        });

        // Pin note
        document.getElementById('pinBtn').addEventListener('click', () => {
            if (this.currentNoteId) this.togglePin(this.currentNoteId);
        });

        // Favorite note
        document.getElementById('favoriteBtn').addEventListener('click', () => {
            if (this.currentNoteId) this.toggleFavorite(this.currentNoteId);
        });

        // Duplicate note
        document.getElementById('duplicateBtn').addEventListener('click', () => {
            if (this.currentNoteId) this.duplicateNote(this.currentNoteId);
        });

        // Archive note
        document.getElementById('archiveBtn').addEventListener('click', () => {
            if (this.currentNoteId) this.toggleArchive(this.currentNoteId);
        });

        // Undo/Redo
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());

        // Note selection
        document.getElementById('notesList').addEventListener('click', (e) => {
            const card = e.target.closest('.note-card');
            if (card) this.selectNote(card.dataset.id);
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

        // Quick filters
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentQuickFilter = e.target.dataset.filter;
                this.renderNotesList();

                const titles = { all: 'All Notes', favorites: 'Favorites', archived: 'Archived' };
                document.getElementById('sectionTitle').textContent = titles[this.currentQuickFilter];
            });
        });

        // Tag filter
        document.getElementById('tagFilter').addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-filter-btn')) {
                document.querySelectorAll('.tag-filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.tag;
                this.renderNotesList();
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
                const writePane = document.querySelector('.write-pane');
                const previewPane = document.querySelector('.preview-pane');

                writePane.classList.remove('active');
                previewPane.classList.remove('active');
                editorContent.classList.remove('split-view');

                if (mode === 'write') {
                    writePane.classList.add('active');
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

        // Context menu
        document.getElementById('contextMenu').addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (!item || !this.contextMenuNoteId) return;

            const action = item.dataset.action;
            const noteId = this.contextMenuNoteId;

            switch (action) {
                case 'open': this.selectNote(noteId); break;
                case 'favorite': this.toggleFavorite(noteId); break;
                case 'pin': this.togglePin(noteId); break;
                case 'duplicate': this.duplicateNote(noteId); break;
                case 'archive': this.toggleArchive(noteId); break;
                case 'delete': this.deleteNote(noteId); break;
            }

            this.hideContextMenu();
        });

        // Close context menu on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#contextMenu')) {
                this.hideContextMenu();
            }
        });

        // Close modals on click outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
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
                this.showToast('Note saved!', 'success');
            }

            // Ctrl/Cmd + F: Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }

            // Ctrl/Cmd + D: Duplicate
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                if (this.currentNoteId) this.duplicateNote(this.currentNoteId);
            }

            // Ctrl/Cmd + E: Archive
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (this.currentNoteId) this.toggleArchive(this.currentNoteId);
            }

            // Ctrl/Cmd + Z: Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }

            // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }

            // Delete: Delete note
            if (e.key === 'Delete' && this.currentNoteId &&
                !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                this.deleteNote(this.currentNoteId);
            }

            // Escape: Clear search or close modals
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('searchInput');
                if (searchInput.value) {
                    searchInput.value = '';
                    this.renderNotesList();
                }
                this.hideContextMenu();
                document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
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

// Make showContextMenu globally accessible for inline event handlers
window.app = app;
