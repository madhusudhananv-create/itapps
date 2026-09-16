# Contributing to AI Maturity Index Platform

Thank you for your interest in contributing to the AI Maturity Index Platform! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Git

### Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## 📝 Development Workflow

### Branch Naming Convention

Use descriptive branch names following this pattern:

```
type/<ticket-id>-description
```

Examples:

- `feature/AIMI-01-description-of-feature`
- `bugfix/AIMI-01-description-of-bug`
- `hotfix/AIMI-01-description-of-hotfix`
- `docs/AIMI-01-description-of-docs`

### Commit Message Format

Follow the following specification:

```
TYPE: (scope) - description
```

Examples:

- `FEATURE: (activities) - add new activity form validation`
- `FIX: (dashboard) - resolve correlation calculation error`
- `DOCS: (readme) - update installation instructions`

### Types

- `FEATURE`: New feature
- `FIX`: Bug fix
- `DOCS`: Documentation changes
- `STYLE`: Code style changes (formatting, etc.)
- `REFACTOR`: Code refactoring
- `TEST`: Adding or updating tests
- `CHORE`: Maintenance tasks

## 🔧 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper types for all functions and variables
- Avoid `any` type - use proper typing instead
- Use interfaces for object shapes and types for unions/primitives

### React/Component Guidelines

- Use functional components with hooks
- Follow the established component structure in `src/features/`
- Use proper prop typing with interfaces
- Implement proper error boundaries where needed

### Styling

- Use Material-UI components and theming
- Follow the established styling patterns in `src/shared/components/`
- Use Emotion for custom styling when needed

### File Organization

- Keep related files together in feature directories
- Use index files for clean imports
- Follow the established project structure

## 🧪 Testing

### Test Requirements

- Write unit tests for utility functions
- Test component behavior with user interactions
- Ensure proper error handling is tested
- Maintain good test coverage

### Running Tests

```bash
npm run test
```

## 📋 Pull Request Process

### Before Submitting

1. Ensure your branch is up to date with main
2. Run linting: `npm run lint`
3. Run tests: `npm run test`
4. Test the application manually
5. Update documentation if needed

### PR Template

Use the appropriate PR template:

- **Standard PR**: Use `pull_request_template.md` for features and significant changes

### Review Process

1. Create a pull request with a clear description
2. Request reviews from appropriate team members
3. Address review comments promptly
4. Ensure all CI checks pass
5. Merge only after approval

## 🐛 Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable

## 💡 Feature Requests

When suggesting features:

- Describe the use case clearly
- Explain the expected benefits
- Consider implementation complexity
- Provide examples if possible

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props with TypeScript interfaces
- Update README files when adding new features

### API Documentation

- Document new API endpoints
- Include request/response examples
- Update API documentation for breaking changes

## 🔒 Security

- Never commit sensitive information (API keys, passwords, etc.)
- Use environment variables for configuration
- Follow security best practices for authentication
- Report security vulnerabilities privately

## 🎯 Project-Specific Guidelines

### AI Maturity Index Features

When working on AI maturity features:

- Follow the established data models in `src/features/activities/types/`
- Use the existing service patterns in `src/features/activities/services/`
- Ensure statistical calculations are accurate and well-tested
- Document new metrics and their formulas

### Dashboard Components

For dashboard improvements:

- Follow the existing component patterns
- Ensure responsive design
- Optimize for performance with large datasets
- Add proper loading states

## 🤝 Getting Help

- Check existing issues and discussions
- Ask questions in GitHub discussions
- Reach out to maintainers for guidance

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the AI Maturity Index Platform! 🚀
