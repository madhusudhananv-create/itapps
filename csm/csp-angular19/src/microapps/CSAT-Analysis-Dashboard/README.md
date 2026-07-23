# CSAT Analysis Dashboard

A modern, responsive web application for analyzing Customer Satisfaction (CSAT) data with comprehensive filtering and visualization capabilities.

## Features

### 📊 Data Display
- **Complete Data Table**:: Shows all CSAT records with columns SNO, PrId, CusId, Score, Comments, Account, Project, and Business Unit
- **Sortable Columns**: Click on any column header to sort data
- **Pagination**: Navigate through large datasets with ease
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🔍 Advanced Filtering
- **Account-wise Filtering**: Filter data by specific accounts
- **Project-wise Filtering**: Filter data by specific projects
- **Business Unit Filtering**: Filter data by business units
- **Combined Filters**: Apply multiple filters simultaneously
- **Active Filter Display**: Visual indicators of applied filters
- **One-click Clear**: Clear all filters with a single button

### 📈 Analytics & Visualizations
- **Account Performance Chart**: Bar chart showing average CSAT scores by account
- **Business Unit Performance**: Bar chart comparing performance across business units
- **Score Distribution**: Pie chart showing the distribution of CSAT scores
- **Top Projects**: Horizontal bar chart of best-performing projects
- **Interactive Tooltips**: Hover over charts for detailed information

### 🎨 Modern UI/UX
- **Clean Design**: Modern, professional interface with gradient headers
- **Color-coded Scores**: Visual indicators for different score ranges
- **Smooth Animations**: Hover effects and transitions
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: Proper contrast and keyboard navigation

## Data Structure

The dashboard displays CSAT data with the following columns:

| Column | Description | Type |
|--------|-------------|------|
| SNO | Serial Number | Number |
| PrId | Project ID | String |
| CusId | Customer ID | String |
| Score | CSAT Score (1-5) | Number |
| Comments | Customer Feedback | String |
| Account | Account Name | String |
| Project | Project Name | String |
| BU | Business Unit | String |

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone or download the project**
   ```bash
   # If you have the project files, navigate to the directory
   cd csat-analysis-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the dashboard

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Usage

### Filtering Data

1. **Account Filter**: Use the Account dropdown to filter data by specific accounts
2. **Project Filter**: Use the Project dropdown to filter data by specific projects
3. **Business Unit Filter**: Use the BU dropdown to filter data by business units
4. **Combined Filtering**: Apply multiple filters to narrow down results
5. **Clear Filters**: Click "Clear All Filters" to reset all filters

### Interacting with Charts

- **Hover over bars/pie slices** to see detailed information
- **Charts update automatically** when filters are applied
- **Responsive charts** that adapt to screen size

### Data Table Features

- **Sort any column** by clicking the column header
- **Navigate pages** using the pagination controls
- **View detailed information** in the comments column
- **Color-coded scores** for quick visual assessment

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Styled Components**: CSS-in-JS for component styling
- **Recharts**: Professional charting library for data visualization
- **Lucide React**: Modern icon library
- **Create React App**: Zero-configuration build tool

## Project Structure

```
csat-analysis-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── FilterPanel.js
│   │   ├── DataTable.js
│   │   └── AnalyticsCharts.js
│   ├── data/
│   │   └── dummyData.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Customization

### Adding New Data

To add new CSAT data, edit the `src/data/dummyData.js` file:

```javascript
export const csatData = [
  {
    sno: 16,
    prId: "PR016",
    cusId: "CUST016",
    score: 4.2,
    comments: "Your new comment here",
    account: "New Account",
    project: "New Project",
    bu: "New Business Unit"
  },
  // ... more data
];
```

### Modifying Charts

The charts are built using Recharts and can be customized by editing the `AnalyticsCharts.js` component.

### Styling Changes

The application uses styled-components. Modify the styled components in each file to change the appearance.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance

- **Optimized rendering** with React.memo and useMemo
- **Efficient filtering** with useMemo hooks
- **Lazy loading** ready for large datasets
- **Responsive design** for all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please create an issue in the project repository or contact the development team. 