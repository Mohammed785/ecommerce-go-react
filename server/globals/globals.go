package globals

import (
	"github.com/doug-martin/goqu/v9"
	"github.com/jmoiron/sqlx"
)


var DB *sqlx.DB
var Dialect goqu.DialectWrapper
