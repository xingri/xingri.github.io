# Gamepad Button Type

| |
|---|
| **Authors** | Matt Reynolds (Google), Sun Shin (NVIDIA |
| **Contacts** | mattreynolds@google.com, sushin@nvidia.com |
| **Status** | Explainer |
| **Chromium Review** | https://crrev.com/c/7760763 |
| **Chromium Bug** | https://issues.chromium.org/issues/339841686 |
| **ChromeStatus** | https://chromestatus.com/feature/5075054393163776 |
| **Specification Proposal** | https://pr-preview.s3.amazonaws.com/xingri/gamepad/pull/196.html#gamepadbuttontype-enum |

## Introduction

This proposal extends the Gamepad API by introducing a new `type` attribute on `GamepadButton`.

The attribute enables web applications to identify specialized gamepad buttons that may require unique handling. The initial use case is identifying controller touchpad buttons through a standardized mechanism.

This proposal is intentionally minimal in scope. The initial specification defines a `trackpad` button type while establishing an extensible framework that may support additional button classifications in the future if compelling web developer use cases emerge.

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

## Background

The Gamepad API currently exposes button state through `GamepadButton` objects, including whether a button is pressed, touched, and its analog value.

However, the API does not provide information describing the functional role of a button.

Modern game controllers increasingly include specialized input mechanisms. One example is the integrated touchpad found on several controllers. Applications that wish to identify touchpad buttons today typically rely on controller-specific button mappings and device-specific heuristics.

This approach can be difficult to maintain and may not generalize across different controllers.

## Motivation

Cloud gaming services, browser-based games, accessibility tools, and other controller-aware web applications often need to distinguish touchpad buttons from conventional gamepad buttons.

Example use cases include:

- Displaying touchpad-specific prompts and tutorials.
- Supporting touchpad interactions in browser-based games.
- Providing accessibility descriptions that accurately reflect controller inputs.
- Enabling controller-aware user interfaces.

Today, these scenarios generally require controller-specific mapping logic.

By exposing touchpad button information directly through the Gamepad API, applications can identify these buttons in a standardized and interoperable manner.

## Goals

This proposal aims to:

- Expose touchpad button information through the Gamepad API.
- Reduce reliance on controller-specific mapping logic.
- Improve interoperability across different controllers.
- Enable richer controller-aware user experiences.
- Maintain compatibility with existing web content.
- Establish a framework that can be extended in the future if additional standardized button classifications become necessary.

## Non-Goals

This proposal does not:

- Expose controller model identifiers.
- Expose manufacturer-specific information.
- Change the existing Gamepad API mapping behavior.
- Introduce controller remapping functionality.
- Define additional button classifications beyond those required by the current use case.

## Proposed API

The proposal adds a new readonly `type` attribute to `GamepadButton`.

### WebIDL

```webidl
enum GamepadButtonType {
  "",
  "trackpad"
};

partial interface GamepadButton {
  readonly attribute GamepadButtonType type;
};
```

### Enumeration Values

| Value | Description |
|---------|-------------|
| `""` | No specific button type information is available |
| `"trackpad"` | The button is associated with a controller touchpad |

Applications should gracefully handle unknown values to allow future extensions.

## Examples

### Detecting a Trackpad Button

```javascript
const gamepad = navigator.getGamepads()[0];

for (const button of gamepad.buttons) {
  if (button.type === "trackpad") {
    console.log("Trackpad button detected");
  }
}
```

### Cloud Gaming User Interface

```javascript
if (button.type === "trackpad") {
  showPrompt("Press the touchpad");
}
```

### Accessibility Support

```javascript
if (button.type === "trackpad") {
  announce("Touchpad button");
}
```

## Future Extensibility

A dedicated `type` attribute was chosen instead of a specialized boolean attribute such as `isTrackpadButton`.

This design allows future button classifications to be introduced through the standards process if additional web platform requirements are identified.

No additional button types are proposed as part of this effort.

## Privacy Considerations

This proposal exposes limited information about controller input capabilities that are already observable through controller behavior and existing mappings.

The proposal does not expose:

- Device identifiers
- Product identifiers
- Manufacturer information
- User-specific information

The expected additional fingerprinting surface is minimal.

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

## Alternatives Considered

### Controller-Specific Mapping Logic

Applications may continue maintaining custom controller mappings.

However, this approach:

- Requires ongoing maintenance.
- Introduces device-specific complexity.
- Scales poorly as new controllers are introduced.

### Dedicated Touchpad Attribute

A dedicated attribute such as:

```webidl
readonly attribute boolean isTrackpadButton;
```

was considered.

An extensible `type` attribute provides a more flexible foundation for future evolution while satisfying the immediate touchpad use case.

## References

- W3C Gamepad API: https://w3c.github.io/gamepad/
- Specification Proposal: https://pr-preview.s3.amazonaws.com/xingri/gamepad/pull/196.html#gamepadbuttontype-enum
- Chromium Review: https://crrev.com/c/7760763
