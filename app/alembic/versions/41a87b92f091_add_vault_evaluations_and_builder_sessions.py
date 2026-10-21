"""Add vault, evaluations, and builder sessions

Revision ID: 41a87b92f091
Revises: 306222f3747f
Create Date: 2026-10-20 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

from database.postgres.database import Base
from database.postgres import models  # noqa: F401 - register ORM tables with Base


# revision identifiers, used by Alembic.
revision: str = '41a87b92f091'
down_revision: Union[str, Sequence[str], None] = '306222f3747f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)

    inspector = inspect(bind)
    if "agents" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("agents")}
    if "eval_status" not in columns:
        op.add_column(
            "agents",
            sa.Column("eval_status", sa.String(), nullable=False, server_default="pending"),
        )
    if "is_deleted" not in columns:
        op.add_column(
            "agents",
            sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        )


def downgrade() -> None:
    try:
        op.drop_table('agent_builder_sessions')
        op.drop_table('evaluation_results')
        op.drop_table('evaluation_scenarios')
        op.drop_table('credential_vault')
    except Exception:
        pass
