# Contributing to Pro Recorder

Thank you for considering contributing to Pro Recorder! We welcome contributions from the community to help make this screen recording tool better for everyone.

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community

## 🚀 How to Contribute

### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/chirag-ganguli/pro-recorder.git
cd pro-recorder
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install

# Run the app in development mode
npm start
```

### 3. Create a Branch
```bash
# Create a branch for your feature or bugfix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

### 4. Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Test your changes thoroughly

### 5. Commit Your Changes
```bash
# Use clear, descriptive commit messages
git add .
git commit -m "feat: add your feature description"
# or
git commit -m "fix: resolve your bugfix description"
```

**Commit Message Convention:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 6. Push and Create Pull Request
```bash
# Push your branch to your fork
git push origin feature/your-feature-name

# Then create a Pull Request on GitHub
```

## 📝 Pull Request Guidelines

### Before Submitting
- [ ] Test your changes on both macOS and Windows (if applicable)
- [ ] Ensure the app builds successfully (`npm run make`)
- [ ] Update documentation if needed
- [ ] Add/update issue templates if adding new features
- [ ] Check for linting errors

### PR Description Template
```markdown
## Description
<!-- Describe your changes in detail -->

## Related Issue
<!-- If this addresses an open issue, mention it here -->
Fixes #ISSUE_NUMBER

## Testing Done
<!-- Describe how you tested your changes -->
- [ ] Tested on macOS
- [ ] Tested on Windows
- [ ] Recording functionality works
- [ ] Conversion functionality works

## Screenshots (if applicable)
<!-- Add screenshots of UI changes -->

## Checklist
- [ ] Code follows project guidelines
- [ ] Self-review completed
- [ ] No console.log or debug statements left
- [ ] Documentation updated (if needed)
```

## 🐛 Reporting Bugs

When reporting bugs, please include:
- Steps to reproduce the issue
- Expected vs actual behavior
- OS and Pro Recorder version
- Screenshots or error messages
- Any relevant logs

Use the **Bug Report** issue template for consistency.

## 💡 Suggesting Features

For feature requests, please:
- Describe the problem you're trying to solve
- Provide a clear use case
- Suggest possible implementation approaches
- Check existing issues to avoid duplicates

Use the **Feature Request** issue template.

## 🏗️ Development Architecture

Pro Recorder is built with:
- **Electron** - Desktop application framework
- **FFmpeg** - Video processing and conversion
- **Node.js** - Backend logic

Key files:
- `main.js` - Main Electron process
- `preload.js` - Preload script for secure IPC
- `renderer.js` - Frontend UI logic
- `index.html` - UI markup
- `forge.config.js` - Electron Forge configuration

## 🔧 Development Tips

### Testing Recording Functionality
1. Select a screen or window
2. Start recording
3. Verify file is being written to disk
4. Stop recording and check file integrity

### Testing Conversion
1. Select a WebM file
2. Test both "Fast" and "Mac-Compatible" modes
3. Verify MP4 output plays correctly

### Building for Production
```bash
# Build for your current platform
npm run make

# Build for all platforms (requires CI/CD)
# See .github/workflows/release.yml
```

## 📄 License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.

## ❓ Questions?

Feel free to open an issue with the "question" label or reach out to the maintainers directly.

---

**Thank you for helping make Pro Recorder better! 🎉**
