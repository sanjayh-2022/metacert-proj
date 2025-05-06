import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
interface QRCodeComponentProps {
  qrData: string
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ qrData }) => {
  return <QRCodeSVG value={qrData} className="w-12 h-12" />
}

export default QRCodeComponent
