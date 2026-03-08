# fix-cmake-timestamps.ps1
# Fixes "ninja: error: manifest 'build.ninja' still dirty after 100 tries"
# on Windows when using Bun. Bun installs packages via symlink junctions and
# sets all file timestamps to the current time. CMake sees source files as
# newer than build artifacts and keeps regenerating build.ninja in a loop.
#
# Fix: Set CMake input file timestamps to a fixed past date so they are
# always older than any generated build artifacts.

$oldDate = [DateTime]::new(2024, 1, 1)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bunDir = Join-Path $scriptDir "..\..\node_modules\.bun"

if (-not (Test-Path $bunDir)) {
    Write-Host "[cmake-fix] node_modules/.bun not found, skipping timestamp fix."
    exit 0
}

$bunDir = (Resolve-Path $bunDir).Path
Write-Host "[cmake-fix] Fixing CMake source timestamps in $bunDir ..."

$count = 0

# Fix CMakeLists.txt and .cmake files - these are what CMake tracks for re-runs
Get-ChildItem -Path $bunDir -Recurse -Include "CMakeLists.txt","*.cmake","cmake_install.cmake" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $_.LastWriteTime = $oldDate
        $count++
    } catch {
        # Skip files we can't modify (e.g., read-only)
    }
}

# Also fix the top-level .bun package directory timestamps
# (CMake uses dir timestamps too in some checks)
Get-ChildItem -Path $bunDir -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $_.LastWriteTime = $oldDate
    } catch {}
}

Write-Host "[cmake-fix] Fixed timestamps on $count CMake files. Build should now work cleanly."
