//go:build windows

package backend

import (
	"fmt"
	"os"

	"golang.org/x/sys/windows/registry"
)

const runRegistryKey = `Software\Microsoft\Windows\CurrentVersion\Run`
const appRegistryName = "TrackPlan"

// IsAutoStartEnabled checks if TrackPlan is set to run on Windows startup
func IsAutoStartEnabled() (bool, error) {
	k, err := registry.OpenKey(registry.CURRENT_USER, runRegistryKey, registry.QUERY_VALUE)
	if err != nil {
		return false, nil
	}
	defer k.Close()

	val, _, err := k.GetStringValue(appRegistryName)
	if err != nil {
		return false, nil
	}
	return val != "", nil
}

// SetAutoStart adds or removes TrackPlan from Windows startup registry
func SetAutoStart(enable bool) error {
	k, err := registry.OpenKey(registry.CURRENT_USER, runRegistryKey, registry.SET_VALUE)
	if err != nil {
		return fmt.Errorf("failed to open registry key: %w", err)
	}
	defer k.Close()

	if enable {
		exePath, err := os.Executable()
		if err != nil {
			return fmt.Errorf("failed to determine executable path: %w", err)
		}
		if err := k.SetStringValue(appRegistryName, fmt.Sprintf("\"%s\"", exePath)); err != nil {
			return fmt.Errorf("failed to write startup registry value: %w", err)
		}
	} else {
		_ = k.DeleteValue(appRegistryName)
	}
	return nil
}
