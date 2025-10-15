# Canvas Storybook - NEW BOARD

A modern web application similar to Miro with interactive canvas, focus object feature, and Storybook integration.

## Features

- 🎨 **Interactive Canvas**: Pan, zoom, and navigate around an infinite canvas
- 📝 **Board Items**: Add text, shapes, and sticky notes to the board
- 🎯 **Focus Object**: Focus on specific objects with smooth viewport transitions
- 🖱️ **Drag & Drop**: Move items around the canvas with mouse interactions
- 📚 **Storybook Integration**: Component documentation and testing
- 🎨 **Modern UI**: Clean, responsive design with smooth animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view the app

### Storybook

To view and test components in Storybook:

```bash
npm run storybook
```

Open [http://localhost:6006](http://localhost:6006) to view Storybook

## Usage

### Canvas Navigation
- **Pan**: Ctrl+Click and drag, or middle mouse button drag
- **Zoom**: Mouse wheel up/down
- **Focus**: Ctrl+F to focus on a random item (for testing)

### Adding Items
- Click "Add Text" to add a text box
- Click "Add Shape" to add a geometric shape
- Click "Add Sticky" to add a sticky note

### Editing Items
- **Select**: Click on any item
- **Edit Text**: Double-click on text items
- **Move**: Click and drag items
- **Delete**: Select an item and press Delete key, or click the × button

### Focus Object Feature

The application includes a focus object feature that allows you to programmatically focus on specific items:

```typescript
// Example focus request
const focusRequest = {
  objectId: 'item-123',
  zoom: 1.5,
  duration: 1000
};

// This would be called via API or programmatically
onFocusRequest(focusRequest);
```

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx          # Main canvas component
│   ├── BoardItem.tsx      # Individual board items
│   ├── Toolbar.tsx         # Top toolbar
│   └── *.stories.tsx       # Storybook stories
├── types.ts               # TypeScript type definitions
├── App.tsx               # Main application component
└── index.tsx             # Application entry point
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Animations and transitions
- **Storybook** - Component documentation and testing

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run storybook` - Start Storybook
- `npm run build-storybook` - Build Storybook
- `npm test` - Run tests

### Focus Object Implementation

The focus object feature is implemented in the Canvas component with smooth animations:

1. **Viewport Calculation**: Calculates the target position to center the object
2. **Smooth Animation**: Uses requestAnimationFrame for smooth transitions
3. **Easing Function**: Implements ease-out animation for natural movement
4. **Zoom Control**: Allows custom zoom levels when focusing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
