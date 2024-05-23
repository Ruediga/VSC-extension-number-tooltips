# number-tooltips README

## Installation

- Clone the repository

- Either run `code --install-extension number-tooltips-[VERSION].vsix`

- Or open vscode, go to extensions, click the three dot icon in the upper right of the extensions bar, click `Install from VSIX` and install from there.

To build yourself, follow the instructions below.

## Requirements for Building

```
npm install
```

## Build

```
# build and run in debug mode
[F5]

# create a .vsix package which you can then add to vscode
> vsce package
```