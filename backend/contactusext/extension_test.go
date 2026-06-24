package contactusext

import (
	"testing"

	"github.com/sneat-co/contactus-ext/backend/contactusmodels/const4contactus"
	"github.com/sneat-co/sneat-go-core/extension"
)

func TestModule(t *testing.T) {
	m := Extension()
	extension.AssertExtension(t, m, extension.Expected{
		ExtID:         const4contactus.ExtensionID,
		HandlersCount: 10,
		DelayersCount: 1,
	})
}
