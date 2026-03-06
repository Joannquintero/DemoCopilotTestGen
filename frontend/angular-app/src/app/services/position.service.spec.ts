import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PositionService } from './position.service';
import { Position, CreatePositionDto, UpdatePositionDto } from '../models/position.model';

describe('PositionService', () => {
  let service: PositionService;

  const mockPosition: Position = {
    id: 1,
    name: 'Frontend Developer',
    description: 'Develop user interfaces with Angular and React',
    minSalary: 45000,
    maxSalary: 65000,
    department: 'Technology',
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  };

  const mockPositions: Position[] = [
    mockPosition,
    {
      id: 2,
      name: 'UX/UI Designer',
      description: 'Design user experiences and graphic interfaces',
      minSalary: 40000,
      maxSalary: 60000,
      department: 'Design',
      isActive: true,
      createdAt: new Date('2023-02-10'),
      updatedAt: new Date('2023-02-10')
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PositionService]
    });
    service = TestBed.inject(PositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPositions', () => {
    it('should return an Observable<Position[]>', (done) => {
      service.getPositions().subscribe(positions => {
        expect(positions.length).toBeGreaterThan(0);
        expect(positions[0].id).toBeDefined();
        expect(positions[0].name).toBeDefined();
        done();
      });
    });

    it('should update signals on successful load', (done) => {
      service.getPositions().subscribe(() => {
        expect(service.positions().length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('getPositionById', () => {
    it('should return an Observable<Position>', (done) => {
      service.getPositionById(1).subscribe(position => {
        expect(position.id).toBe(1);
        expect(position.name).toBeDefined();
        done();
      });
    });

    it('should handle error when position not found', (done) => {
      service.getPositionById(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('getPositionsByDepartment', () => {
    it('should return positions filtered by department', (done) => {
      service.getPositionsByDepartment('Technology').subscribe(positions => {
        expect(positions.every(p => p.department === 'Technology')).toBeTruthy();
        done();
      });
    });
  });

  describe('getActivePositions', () => {
    it('should return only active positions', (done) => {
      service.getActivePositions().subscribe(positions => {
        expect(positions.every(p => p.isActive)).toBeTruthy();
        done();
      });
    });
  });

  describe('createPosition', () => {
    it('should create a new position', (done) => {
      const newPositionDto: CreatePositionDto = {
        name: 'New Position',
        description: 'Description of the new position',
        minSalary: 35000,
        maxSalary: 55000,
        department: 'New Department',
        isActive: true
      };

      service.createPosition(newPositionDto).subscribe(position => {
        expect(position.name).toBe(newPositionDto.name);
        expect(position.id).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('updatePosition', () => {
    it('should update an existing position', (done) => {
      const updatePositionDto: UpdatePositionDto = {
        id: 1,
        name: 'Updated Position',
        minSalary: 50000
      };

      service.updatePosition(updatePositionDto).subscribe(position => {
        expect(position.name).toBe('Updated Position');
        expect(position.minSalary).toBe(50000);
        done();
      });
    });

    it('should handle error when updating non-existent position', (done) => {
      const updatePositionDto: UpdatePositionDto = {
        id: 999,
        name: 'Updated Position'
      };

      service.updatePosition(updatePositionDto).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('deletePosition', () => {
    it('should delete a position', (done) => {
      const initialLength = service.positions().length;
      
      service.deletePosition(1).subscribe(() => {
        expect(service.positions().length).toBe(initialLength - 1);
        done();
      });
    });

    it('should handle error when deleting non-existent position', (done) => {
      service.deletePosition(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('refreshPositions', () => {
    it('should call getPositions', () => {
      spyOn(service, 'getPositions').and.returnValue(of(mockPositions));
      
      service.refreshPositions();
      
      expect(service.getPositions).toHaveBeenCalled();
    });
  });

  describe('signals', () => {
    it('should provide readonly signals', () => {
      expect(service.positions).toBeTruthy();
      expect(service.loading).toBeTruthy();
      expect(service.error).toBeTruthy();
    });

    it('should start with initial state', () => {
      expect(service.positions().length).toBeGreaterThan(0);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe(null);
    });
  });
});