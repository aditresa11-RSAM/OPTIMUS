const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

const oldHeader = `<div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">`;

const newHeader = `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">`;

// Note: we need to make sure we replace it correctly since the nesting level changes.
code = code.replace(
  `<div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">`,
  `<div className="pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">`
);

fs.writeFileSync('src/pages/risiko.tsx', code);
