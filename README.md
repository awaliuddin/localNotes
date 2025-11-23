# 📝 LocalNotes

A beautiful, feature-rich, and privacy-focused note-taking application that runs entirely in your browser. No server, no signup, just pure local storage.

![LocalNotes](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Pure JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

## ✨ Features

### Core Functionality
- 📝 **Rich Note Taking** - Create, edit, and delete notes with ease
- 💾 **Auto-save** - Your notes are automatically saved as you type
- 🔍 **Powerful Search** - Search through titles, content, and tags in real-time
- 🏷️ **Tag System** - Organize notes with custom tags
- 📌 **Pin Notes** - Keep important notes at the top
- 🎨 **Color Coding** - Color-code your notes for visual organization

### Advanced Features
- ✍️ **Markdown Support** - Write in markdown with live preview
- 👁️ **Split View** - Write and preview simultaneously
- 📤 **Export/Import** - Backup and restore your notes as JSON
- 🌙 **Dark Mode** - Beautiful dark theme for night-time writing
- ⌨️ **Keyboard Shortcuts** - Work faster with keyboard commands
- 📊 **Statistics** - Track total notes and tags
- 🔢 **Word Count** - Real-time word and character counting
- 📱 **Responsive Design** - Works perfectly on all devices

### Privacy & Performance
- 🔒 **100% Private** - All data stored locally in your browser
- ⚡ **Lightning Fast** - No server delays, instant response
- 🌐 **Offline First** - Works without internet connection
- 🎯 **Zero Dependencies** - Pure vanilla JavaScript, no frameworks

## 🚀 Quick Start

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/localNotes.git
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
1. Click the **"➕ New Note"** button in the sidebar
2. Give your note a title
3. Start writing your content
4. Add tags by typing in the tag input and pressing Enter
5. Choose a color to categorize your note

### Writing with Markdown
LocalNotes supports common markdown syntax:

```markdown
# Heading 1
## Heading 2
### Heading 3

**bold text**
*italic text*

- List item
- Another item

[ ] Todo item
[x] Completed todo

`inline code`

> Quote text
```

### Organizing Notes
- **Pin Important Notes**: Click the 📌 icon to keep notes at the top
- **Color Coding**: Use the color selector to visually categorize notes
- **Tags**: Add multiple tags to organize and filter notes
- **Search**: Use the search bar to find notes by title, content, or tags
- **Sort**: Sort notes by modification date, creation date, title, or color

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - Create new note
- `Ctrl/Cmd + S` - Save current note
- `Ctrl/Cmd + F` - Focus search
- `Ctrl/Cmd + D` - Delete current note

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

1. **Quick Navigation**: Click on any note in the list to open it instantly
2. **Bulk Organization**: Use the tag filter to see all notes with a specific tag
3. **Keep It Organized**: Use a combination of pins, colors, and tags for maximum organization
4. **Regular Backups**: Export your notes regularly to keep backups
5. **Split View**: Use split view mode when working with markdown for the best experience
6. **Auto-save**: Just start typing - there's no need to manually save!

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
- Color preference
- Pin status
- Creation and modification timestamps

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
