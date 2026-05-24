"""add_rate_at_purchase_to_bills

Revision ID: f34567f6aeb1
Revises: fdeffc65aefe
Create Date: 2025-04-26 23:16:24.208116

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f34567f6aeb1'
down_revision: Union[str, None] = 'fdeffc65aefe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
