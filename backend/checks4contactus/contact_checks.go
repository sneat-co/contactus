package checks4contactus

import (
	"slices"

	"github.com/sneat-co/contactus-ext/backend/contactusmodels/const4contactus"
)

func IsSpaceMember(roles []string) bool {
	return slices.Contains(roles, const4contactus.SpaceMemberRoleMember)
}
