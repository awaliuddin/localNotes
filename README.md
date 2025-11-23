# 📝 LocalNotes

A beautiful, feature-rich, and privacy-focused note-taking application that runs entirely in your browser. No server, no signup, just pure local storage.

![LocalNotes](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Pure JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

## ✨ Features

### Core Functionality
- 📝 **Rich Note Taking** - Create, edit, and delete notes with ease
- 💾 **Auto-save** - Your notes are automatically saved as you type
- 🔍 **Powerful Search** - Search through titles, content, and tags in real-time
- 🏷️ **Tag System** - Organize notes with custom tags and filters
- 📌 **Pin Notes** - Keep important notes at the top
- ⭐ **Favorites** - Star your most important notes for quick access
- 📦 **Archive** - Archive old notes without deleting them
- 🎨 **Color Coding** - 7 beautiful colors for visual organization

### Productivity Features
- 📋 **Note Templates** - 7 pre-made templates (Meeting, To-Do, Journal, Ideas, Code, Research)
- ↶ **Undo/Redo** - Full undo/redo support with 50-step history
- 📑 **Duplicate Notes** - Clone notes instantly
- 🖱️ **Context Menu** - Right-click notes for quick actions
- 🔔 **Toast Notifications** - Beautiful feedback for all actions
- 💬 **Welcome Screen** - Guided onboarding for new users

### Advanced Features
- ✍️ **Enhanced Markdown** - Support for headers, bold, italic, strikethrough, links, images, code blocks, lists, todos, blockquotes, and more
- 👁️ **Split View** - Write and preview simultaneously
- 📤 **Export/Import** - Backup and restore your notes as JSON
- 🌙 **Dark Mode** - Beautiful dark theme for night-time writing
- ⌨️ **Keyboard Shortcuts** - 10+ shortcuts for power users
- 📊 **Statistics** - Track notes, tags, archived items, and storage usage
- 🔢 **Word Count** - Real-time word and character counting
- 💾 **Storage Monitor** - Visual indicator of storage usage
- 📱 **Responsive Design** - Works perfectly on all devices

### Privacy & Performance
- 🔒 **100% Private** - All data stored locally in your browser
- ⚡ **Lightning Fast** - No server delays, instant response
- 🌐 **Offline First** - Works without internet connection
- 🎯 **Zero Dependencies** - Pure vanilla JavaScript, no frameworks
- 🔐 **No Tracking** - Zero analytics or telemetry

## 🚀 Quick Start

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/awaliuddin/localNotes.git
   cd localNotes
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     python -m http.server 8000
     # Then visit http://localhost:8000
     ```

3. **Start taking notes!**
   - Click "New Note" to create your first note
   - Start typing and it will auto-save
   - Use tags to organize your notes

## 📖 How to Use

### Creating Notes
1. Click the **"➕ New Note"** button for a blank note
2. **Or** select a template from the dropdown for pre-formatted notes:
   - 📄 Blank Note
   - 💼 Meeting Notes
   - ✅ To-Do List
   - 📔 Journal Entry
   - 💡 Ideas & Brainstorm
   - 💻 Code Snippet
   - 🔬 Research Notes
3. Give your note a title (auto-fills from template)
4. Start writing your content
5. Add tags by typing in the tag input and pressing Enter
6. Choose a color to categorize your note

### Quick Actions
- **⭐ Favorite** - Star important notes for quick access
- **📌 Pin** - Keep notes at the top of your list
- **📋 Duplicate** - Create a copy of any note
- **📦 Archive** - Hide notes without deleting them
- **↶↷ Undo/Redo** - Revert or reapply changes
- **Right-click** any note for a context menu with all actions

### Writing with Markdown
LocalNotes supports extensive markdown syntax:

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4

**bold** *italic* ***bold italic***
__bold__ _italic_ ___bold italic___
~~strikethrough~~

- Unordered list
* Another item

1. Ordered list
2. Second item

- [ ] Todo item
- [x] Completed todo

`inline code`

```
Code block
Multiple lines
```

> Blockquote text

[Link text](https://example.com)
![Image alt](https://example.com/image.jpg)

---
Horizontal rule
```

### Organizing Notes
- **Quick Filters**: Switch between All Notes, Favorites, and Archived
- **Pin Important Notes**: Click the 📌 icon to keep notes at the top
- **Favorite Notes**: Click ⭐ to add to favorites for quick access
- **Color Coding**: Use the color selector to visually categorize notes (7 colors)
- **Tags**: Add multiple tags to organize and filter notes
- **Search**: Use the search bar to find notes by title, content, or tags
- **Sort**: Sort notes by modification date, creation date, title, or color
- **Archive**: Move old notes to archive to declutter your workspace

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - Create new note
- `Ctrl/Cmd + S` - Save current note
- `Ctrl/Cmd + F` - Focus search
- `Ctrl/Cmd + D` - Duplicate current note
- `Ctrl/Cmd + E` - Archive/Unarchive note
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` - Redo
- `Delete` - Delete current note (when not editing)
- `Escape` - Clear search or close modals

### Backup & Restore
- **Export**: Click the 📤 button to download all notes as JSON
- **Import**: Click the 📥 button to import notes from a JSON file

## 🎨 Customization

### Theme
Toggle between light and dark mode using the 🌙/☀️ button in the header. Your preference is saved automatically.

### Colors
Choose from 7 beautiful colors to organize your notes:
- 🔴 Red
- 🟠 Orange
- 🟡 Yellow
- 🟢 Green
- 🔵 Blue
- 🟣 Purple
- 🌸 Pink

## 💡 Tips & Tricks

1. **Use Templates**: Save time with pre-formatted templates for common note types
2. **Right-Click Power**: Right-click any note for quick access to all actions
3. **Favorites + Pins**: Combine favorites and pins for a powerful organizational system
4. **Archive Old Notes**: Keep your workspace clean by archiving completed or old notes
5. **Undo Mistakes**: Made a mistake? Ctrl+Z works across all note operations
6. **Quick Navigation**: Click on any note in the list to open it instantly
7. **Bulk Organization**: Use the tag filter to see all notes with a specific tag
8. **Keep It Organized**: Use a combination of favorites, pins, colors, and tags
9. **Regular Backups**: Export your notes regularly to keep backups
10. **Split View**: Use split view mode when working with markdown for the best experience
11. **Auto-save**: Just start typing - there's no need to manually save!
12. **Storage Monitor**: Keep an eye on the storage indicator to manage your data
13. **Keyboard Shortcuts**: Master the shortcuts to work 10x faster

## 🔧 Technical Details

### Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No frameworks or libraries
- **LocalStorage API** - Client-side data persistence

### Browser Support
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

### File Structure
```
localNotes/
├── index.html      # Main HTML structure
├── styles.css      # All styling and themes
├── script.js       # Application logic
└── README.md       # Documentation
```

### Data Storage
All notes are stored in your browser's LocalStorage. Each note contains:
- Unique ID
- Title and content
- Tags array
- Color preference (7 colors available)
- Pin status (boolean)
- Favorite status (boolean)
- Archive status (boolean)
- Creation timestamp (ISO format)
- Last modification timestamp (ISO format)

The app also stores:
- User theme preference (light/dark)
- Welcome screen status
- 50-step undo/redo history

## 🛡️ Privacy & Security

- **No tracking**: Zero analytics or tracking code
- **No servers**: All data stays on your device
- **No account**: No signup or login required
- **Open source**: Inspect the code yourself
- **Offline capable**: Works without internet

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🙏 Acknowledgments

Built with ❤️ for people who value privacy and simplicity.

---

**Made with 📝 LocalNotes** - Your thoughts, organized and private.
