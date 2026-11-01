import os
from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings

settings = get_settings()

_is_sqlite = settings.database_url.startswith("sqlite")

connect_args = {}

if _is_sqlite:
    connect_args = {"check_same_thread": False}

    def _enable_sqlite_fk(dbapi_conn, _record):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()

else:
    ssl_ca = os.getenv("DB_SSL_CA")

    if ssl_ca:
        connect_args = {
            "ssl": {
                "ca": ssl_ca
            }
        }

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    future=True,
)

if _is_sqlite:
    event.listen(engine, "connect", _enable_sqlite_fk)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
    class_=Session,
)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
        