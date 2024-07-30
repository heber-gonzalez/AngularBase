# Define base project directory (replace with your actual path)
$baseProjectDir = "C:\Users\heber.gonzalez\Documents\Proyectos\Bases\AngularBase"

# Prompt user for new project name
$projectName = Read-Host "Enter new project name"

# Define directory for new project
$newProjectDir = "C:\Users\heber.gonzalez\Documents\Proyectos\$projectName"

# Check if project directory already exists
if (Test-Path $newProjectDir -PathType Container) {
  Write-Error "Error: Project directory already exists!"
  Exit 1
}

# Copy base project template to new project directory
Write-Host "Creating new project directory..."
Copy-Item -Path $baseProjectDir -Destination $newProjectDir -Recurse -Exclude ("node_modules*")

# Install dependencies in the new project directory
Set-Location -Path $newProjectDir
yarn install

# Remove any existing Git repository
if (Test-Path -Path ".git" -PathType Container) {
  Remove-Item -Path ".git" -Recurse -Force
}

# Initialize a new Git repository (optional)
git init > $null 2>&1  # Suppress output

Write-Host "New project $projectName created successfully with dependencies installed!"
