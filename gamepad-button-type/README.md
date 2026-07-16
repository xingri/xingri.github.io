# Gamepad Button Type

| |
|---|
| **Authors** | Matt Reynolds (Google), Marcos Cáceres(Apple), Sun Shin (NVIDIA) |
| **Contacts** | mattreynolds@google.com, caceres_m@apple.com, sushin@nvidia.com |
| **Status** | Explainer |
| **Chromium Bug** | https://issues.chromium.org/issues/339841686 |
| **ChromeStatus** | https://chromestatus.com/feature/5075054393163776 |
| **WebKit Bug** | https://bugs.webkit.org/show_bug.cgi?id=266293 |
| **Specification Proposal** | https://github.com/w3c/gamepad/pull/196 |

## Introduction

This proposal extends the Gamepad API by introducing a new `type` attribute on `GamepadButton`.

The attribute enables web applications to identify whether a button is part of the Standard Gamepad mapping, represents a controller-specific extension, or corresponds to a trackpad input.

The primary motivation for this proposal is improving support for controller touchpads through a standardized and interoperable mechanism. At the same time, the proposed enumeration provides useful classification information for existing and future controller inputs.

The proposal is fully backward compatible with existing Gamepad API implementations.

## Specification Status

This proposal is being developed as an extension to the W3C Gamepad API specification.

Specification work is currently under discussion within the Web Applications Working Group and is tracked through the following pull request:

- https://pr-preview.s3.amazonaws.com/xingri/gamepad/pull/196.html#gamepadbuttontype-enum

The proposal introduces:

- The `GamepadButtonType` enum
- The `GamepadButton.type` attribute

Specification status:

> Specification currently under development in a Working Group.

## Implementation Status

### Chromium

Implementation is under review in Chromium:

- Chromium Review: https://crrev.com/c/7760763

### WebKit

WebKit has active implementation work for the same proposal:

- WebKit Pull Request: https://github.com/WebKit/WebKit/pull/65693

The existence of implementation efforts across multiple browser engines helps validate the usefulness and interoperability of the proposed API.

## Background

The Gamepad API currently exposes button state through `GamepadButton` objects, including whether a button is pressed, touched, and its analog value.

However, applications do not have access to information describing the role of a button within a controller mapping.

Applications frequently need to determine whether a button is part of the Standard Gamepad mapping or represents a controller-specific extension. In addition, modern controllers increasingly expose specialized inputs such as touchpads that developers may wish to identify explicitly.

Today, these distinctions generally require controller-specific button index mappings and custom application logic.

## Motivation

The Gamepad API exposes button state through `GamepadButton` objects, but it does not provide information about the role of a button within a controller's mapping.

Applications frequently need to determine whether a button is part of the Standard Gamepad mapping or represents a controller-specific extension.

Examples include:

- Cloud gaming services displaying controller-specific prompts.
- Browser-based games adapting to controller capabilities.
- Accessibility software providing meaningful descriptions of controller inputs.
- Applications identifying touchpad inputs available on controllers such as DualShock and DualSense devices.

Today, web applications typically rely on controller-specific button indices and custom mapping logic to make these distinctions.

By exposing button type information directly through the Gamepad API, applications can identify standard buttons, non-standard buttons, and touchpad buttons using a consistent and interoperable mechanism.

### Trackpad Use Case

Several game controllers expose integrated touchpads that are used by games as distinct input mechanisms.

For example, cloud gaming services may wish to display prompts such as:

> Press the touchpad.

Without explicit button classification information, applications must rely on controller-specific button indices and mapping tables to identify these controls.

Providing a dedicated `trackpad` button type allows applications to recognize this functionality directly through the platform.

## Goals

This proposal aims to:

- Expose button type information through the Gamepad API.
- Allow applications to distinguish standard and non-standard buttons.
- Provide a standardized mechanism for identifying trackpad buttons.
- Reduce reliance on controller-specific mapping tables.
- Improve interoperability across different controller implementations.
- Maintain compatibility with existing web content.

## Non-Goals

This proposal does not:

- Expose controller model identifiers.
- Expose manufacturer-specific information.
- Change existing Gamepad API mapping behavior.
- Introduce controller remapping functionality.
- Expose vendor-specific button names.

## Proposed API

The proposal adds a new readonly `type` attribute to `GamepadButton`.

### WebIDL

```webidl
enum GamepadButtonType {
  "non-standard",
  "standard",
  "trackpad",
};

partial interface GamepadButton {
  readonly attribute GamepadButtonType type;
};
```

## Enumeration Values

| Value | Description |
|---------|-------------|
| `standard` | Represents a button whose type is defined by the Standard Gamepad mapping. |
| `non-standard` | Represents a button that exists on the controller but does not have a corresponding standard button type. |
| `trackpad` | Represents a trackpad input type. |

### Classification Model

Trackpad inputs are represented as a dedicated button classification because they have known cross-device semantics and existing web developer use cases.

In contrast, `non-standard` is intended for controller-specific buttons that do not correspond to a standardized button type.

## Examples

### Detecting Trackpad Buttons

```javascript
const gamepad = navigator.getGamepads()[0];

for (const button of gamepad.buttons) {
  if (button.type === "trackpad") {
    console.log("Trackpad button detected");
  }
}
```

### Displaying Touchpad Prompts

```javascript
if (button.type === "trackpad") {
  showPrompt("Press the touchpad");
}
```

### Detecting Controller-Specific Buttons

```javascript
for (const button of gamepad.buttons) {
  if (button.type === "non-standard") {
    console.log("Controller-specific button");
  }
}
```

### Processing Standard Buttons

```javascript
const standardButtons = gamepad.buttons.filter(
  button => button.type === "standard"
);
```

## Future Evolution

The current proposal introduces three button classifications:

- `standard`
- `non-standard`
- `trackpad`

These classifications address current web developer needs while providing a structured mechanism for future evolution.

Any future additions would require separate specification review and Working Group consensus.

## Privacy Considerations

This proposal exposes limited information about controller input classifications that are already observable through controller behavior and existing mappings.

The proposal does not expose:

- Device identifiers
- Product identifiers
- Manufacturer information
- User-specific information

The additional fingerprinting surface is expected to be minimal.

## Security Considerations

The proposal is read-only.

It does not introduce any new device capabilities and does not modify the existing Gamepad API security model.

No additional permissions are required.

## Compatibility

The proposal is fully backward compatible.

Existing content will continue to function without modification.

Applications can detect support using:

```javascript
if ("type" in GamepadButton.prototype) {
  // Feature supported.
}
```

## References

- W3C Gamepad API: https://w3c.github.io/gamepad/
- Specification Proposal: https://pr-preview.s3.amazonaws.com/xingri/gamepad/pull/196.html#gamepadbuttontype-enum
