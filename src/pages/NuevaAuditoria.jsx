import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Building2,
  DollarSign,
  ShieldCheck,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const NuevaAuditoria = () => {
  const [formData, setFormData] = useState({
    tipo: '',
    titulo: '',
    descripcion: '',
    area: '',
    auditor: '',
    fechaInicio: '',
    fechaFin: '',
    prioridad: '',
    objetivos: '',
    alcance: ''
  });

  const tiposAuditoria = [
    {
      id: 'operativa',
      nombre: 'Operativa',
      descripcion: 'Evaluación de procesos internos, sucursales e inventario',
      icon: Building2,
      color: 'border-mascotera-accent text-mascotera-accent'
    },
    {
      id: 'financiera',
      nombre: 'Financiera',
      descripcion: 'Control contable, revisión de gastos e ingresos',
      icon: DollarSign,
      color: 'border-mascotera-warning text-mascotera-warning'
    },
    {
      id: 'calidad',
      nombre: 'Calidad',
      descripcion: 'Estándares de servicio y control de productos',
      icon: ShieldCheck,
      color: 'border-mascotera-success text-mascotera-success'
    }
  ];

  const areas = [
    'Sucursal Centro',
    'Sucursal Norte',
    'Sucursal Sur',
    'Almacén Principal',
    'Administración',
    'Logística',
    'Recursos Humanos'
  ];

  const auditores = [
    'María García',
    'Carlos López',
    'Ana Martínez',
    'Juan Pérez',
    'Laura Sánchez',
    'Roberto Díaz'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos de la auditoría:', formData);
    // Aquí iría la lógica para guardar
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/auditorias"
          className="p-2 rounded-lg bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="title-yellow text-2xl">Nueva Auditoría</h1>
          <p className="text-mascotera-text-muted mt-1">
            Completa el formulario para crear una nueva auditoría
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Auditoría */}
        <div className="card-mascotera">
          <h2 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-mascotera-accent/20 flex items-center justify-center text-mascotera-accent text-sm font-bold">1</span>
            Tipo de Auditoría
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiposAuditoria.map((tipo) => {
              const Icon = tipo.icon;
              const isSelected = formData.tipo === tipo.id;
              return (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipo: tipo.id }))}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? `${tipo.color} bg-mascotera-darker`
                      : 'border-mascotera-border hover:border-mascotera-text-muted'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${isSelected ? '' : 'text-mascotera-text-muted'}`} />
                  <h3 className={`font-semibold ${isSelected ? '' : 'text-mascotera-text'}`}>
                    {tipo.nombre}
                  </h3>
                  <p className="text-sm text-mascotera-text-muted mt-1">
                    {tipo.descripcion}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Información General */}
        <div className="card-mascotera">
          <h2 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-mascotera-accent/20 flex items-center justify-center text-mascotera-accent text-sm font-bold">2</span>
            Información General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm text-mascotera-text-muted mb-2">
                Título de la Auditoría *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Ej: Auditoría de Procesos de Ventas Q4 2024"
                className="input-mascotera w-full"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-mascotera-text-muted mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describe brevemente el propósito de esta auditoría..."
                rows={3}
                className="input-mascotera w-full resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">
                Área a Auditar *
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="input-mascotera w-full"
                required
              >
                <option value="">Seleccionar área...</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">
                Auditor Responsable *
              </label>
              <select
                name="auditor"
                value={formData.auditor}
                onChange={handleInputChange}
                className="input-mascotera w-full"
                required
              >
                <option value="">Seleccionar auditor...</option>
                {auditores.map((auditor) => (
                  <option key={auditor} value={auditor}>{auditor}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Planificación */}
        <div className="card-mascotera">
          <h2 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-mascotera-accent/20 flex items-center justify-center text-mascotera-accent text-sm font-bold">3</span>
            Planificación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">
                Fecha de Inicio *
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-mascotera-text-muted" />
                <input
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  className="input-mascotera w-full pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">
                Fecha Estimada de Fin
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-mascotera-text-muted" />
                <input
                  type="date"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                  className="input-mascotera w-full pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">
                Prioridad *
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleInputChange}
                className="input-mascotera w-full"
                required
              >
                <option value="">Seleccionar prioridad...</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Objetivos y Alcance */}
        <div className="card-mascotera">
          <h2 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-mascotera-accent/20 flex items-center justify-center text-mascotera-accent text-sm font-bold">4</span>
            Objetivos y Alcance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">
                Objetivos
              </label>
              <textarea
                name="objetivos"
                value={formData.objetivos}
                onChange={handleInputChange}
                placeholder="Define los objetivos principales de la auditoría..."
                rows={4}
                className="input-mascotera w-full resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">
                Alcance
              </label>
              <textarea
                name="alcance"
                value={formData.alcance}
                onChange={handleInputChange}
                placeholder="Define el alcance y limitaciones de la auditoría..."
                rows={4}
                className="input-mascotera w-full resize-none"
              />
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-mascotera-accent/10 border border-mascotera-accent/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-mascotera-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-mascotera-accent">Consejos para una auditoría efectiva</p>
              <ul className="text-sm text-mascotera-text-muted mt-2 space-y-1">
                <li>• Define objetivos claros y medibles</li>
                <li>• Establece un alcance realista según el tiempo disponible</li>
                <li>• Selecciona el checklist apropiado para el tipo de auditoría</li>
                <li>• Documenta todos los hallazgos con evidencia</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link to="/auditorias" className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            Crear Auditoría
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaAuditoria;
