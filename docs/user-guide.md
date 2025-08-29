# Snyk ServiceNow Troubleshooting Knowledge Base - User Guide

## Overview

The Snyk ServiceNow Troubleshooting Knowledge Base is a dynamic web application that provides searchable documentation and troubleshooting guides for Snyk's ServiceNow integration.

## Getting Started

### Accessing the Application

1. Open your web browser
2. Navigate to the application URL (typically http://localhost:3003 for local deployment)
3. You'll see the main documentation page

### User Roles

**Viewer (Public Access)**
- Browse all published documentation
- Search across all content
- Export documentation to Word format
- No account required

**Editor (Authenticated Access)**
- All Viewer capabilities
- Create new documentation
- Edit existing documentation
- Delete documentation
- Requires account registration

## For All Users

### Browsing Documentation

1. **Category Tabs**: Documentation is organized by categories (Installation, Configuration, Troubleshooting, etc.)
2. **Document Cards**: Click on any document title to expand and view full content
3. **Images**: Screenshots and diagrams are displayed within document content

### Searching Documentation

1. Use the search bar at the top of the documentation section
2. Type keywords related to your issue
3. Results will filter in real-time across all categories
4. Search looks through titles, descriptions, and categories

### Exporting Documentation

1. Click the "Export to Doc" button in the top-right corner
2. A Word document (.docx) will be generated and downloaded
3. The export includes all published documentation organized by category
4. Perfect for offline reference or sharing

## For Editors

### Creating an Account

1. Click "Sign Up" in the top-right corner
2. Fill in your details:
   - Email address
   - Password (minimum 6 characters)
   - Name (optional)
   - **Role**: Select "Editor"
3. Click "Create Account"
4. Sign in with your new credentials

### Adding New Documentation

1. Sign in to your Editor account
2. Click the "Add Documentation" button (+ icon)
3. Fill in the form:
   - **Category**: Select from predefined categories
   - **Title**: Clear, descriptive title
   - **Description**: Detailed instructions or information
   - **Screenshot** (optional): Upload an image (JPEG, PNG, GIF, WebP, max 5MB)
4. Click "Create Document"
5. The new document will appear immediately in the appropriate category

### Editing Documentation

1. Navigate to the document you want to edit
2. Click the edit icon (pencil) on the document card
3. Modify any fields in the edit form:
   - Update title, description, or category
   - Replace or remove the current image
   - Add a new image if none exists
4. Click "Update Document"
5. Changes appear immediately

### Deleting Documentation

1. Navigate to the document you want to delete
2. Click the delete icon (trash can) on the document card
3. Confirm the deletion in the popup dialog
4. The document and associated image will be permanently removed

## Best Practices

### Writing Effective Documentation

1. **Clear Titles**: Use descriptive titles that indicate the specific issue or topic
2. **Detailed Descriptions**: Include step-by-step instructions
3. **Proper Categories**: Choose the most appropriate category for easy discovery
4. **Visual Aids**: Include screenshots when they help clarify instructions
5. **Regular Updates**: Keep documentation current with software changes

### Image Guidelines

1. **File Types**: Use JPEG, PNG, GIF, or WebP formats
2. **File Size**: Keep images under 5MB for optimal performance
3. **Quality**: Use clear, high-resolution screenshots
4. **Relevance**: Ensure images directly support the documentation content

### Organization Tips

1. **Consistent Naming**: Use consistent terminology across documents
2. **Logical Categorization**: Place documents in the most logical category
3. **Avoid Duplication**: Check for existing documentation before creating new content
4. **Regular Review**: Periodically review and update existing documentation

## Troubleshooting

### Common Issues

**Cannot Sign In**
- Verify your email and password
- Ensure you registered with "Editor" role
- Clear browser cookies and try again

**Cannot Upload Images**
- Check file size (must be under 5MB)
- Verify file type (JPEG, PNG, GIF, WebP only)
- Ensure stable internet connection

**Documents Not Appearing**
- Refresh the page
- Check if you're in the correct category tab
- Verify the document was saved successfully

**Search Not Working**
- Try different keywords
- Check spelling
- Use broader search terms

### Getting Help

If you encounter issues not covered in this guide:
1. Check the deployment guide for technical issues
2. Contact your system administrator
3. Review the application logs if you have access

## Security Notes

- Only Editors can modify content
- All write operations require authentication
- File uploads are validated for security
- Sessions expire for security (re-login required)
- All changes are tracked with timestamps and author information

## Mobile Usage

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

The interface adapts automatically to your screen size for optimal viewing and interaction.
