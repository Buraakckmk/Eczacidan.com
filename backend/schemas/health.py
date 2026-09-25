"""Sağlık endpoint'i için response şeması.

Pydantic modelleri, API contract'ı olarak kullanılır. Bu sayede web ve mobil
uygulamalar ile backend arasında net bir veri sözleşmesi oluşur.
"""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Sağlık kontrol endpoint'inin response yapısı."""

    status: str
    service: str
    version: str
