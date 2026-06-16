import React, { useEffect, useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { MachineGroup, Machine } from '../types';

interface EstoqueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EstoqueModal: React.FC<EstoqueModalProps> = ({ isOpen, onClose }) => {
  const [groups, setGroups] = useState<MachineGroup[]>([]);

  useEffect(() => {
    if (isOpen) {
      firestoreService.getMachines().then((machines) => {
        const groupMap = new Map<string, MachineGroup>();
        (machines as Machine[]).forEach((machine) => {
          const key = machine.name?.trim().toLowerCase() || 'sem nome';
          if (!groupMap.has(key)) {
            groupMap.set(key, {
              name: machine.name || 'Sem nome',
              type: machine.type || '',
              total: 0,
              available: 0,
              rented: 0,
              maintenance: 0,
              machines: [],
            });
          }
          const group = groupMap.get(key)!;
          group.total++;
          if (machine.status === 'available') group.available++;
          else if (machine.status === 'rented') group.rented++;
          else if (machine.status === 'maintenance') group.maintenance++;
          group.machines.push(machine);
        });

        const sorted = Array.from(groupMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        setGroups(sorted);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6 w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-secondary-500 dark:text-white">Estoque Agrupado</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white text-2xl font-bold">&times;</button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th className="text-center">Total</th>
                <th className="text-center text-success-500">Disponível</th>
                <th className="text-center text-warning-500">Alugado</th>
                <th className="text-center text-danger-500">Manutenção</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.name}>
                  <td className="font-bold">{g.name}</td>
                  <td>{g.type}</td>
                  <td className="text-center font-bold">{g.total}</td>
                  <td className="text-center font-medium text-success-600">{g.available}</td>
                  <td className="text-center font-medium text-warning-600">{g.rented}</td>
                  <td className="text-center font-medium text-danger-600">{g.maintenance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EstoqueModal;
