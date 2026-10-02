//go:build !windows

package backend

// IsAutoStartEnabled stub for non-windows platforms
func IsAutoStartEnabled() (bool, error) {
	return false, nil
}

// SetAutoStart stub for non-windows platforms
func SetAutoStart(enable bool) error {
	return nil
}
