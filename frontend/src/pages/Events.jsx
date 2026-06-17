import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ExternalLink, 
  PlusCircle, 
  Filter, 
  Search,
  CheckCircle2,
  CalendarDays,
  Tag
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [filterType]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      
      const res = await api.get('/events', { params });
      setEvents(res.data.events);
    } catch (err) {
      console.error('Error fetching events:', err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (eventId) => {
    setEnrollingId(eventId);
    try {
      await api.post(`/events/${eventId}/enroll`);
      toast.success('Successfully enrolled in event!');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error enrolling in event');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleWithdraw = async (eventId) => {
    setEnrollingId(eventId);
    try {
      await api.post(`/events/${eventId}/enroll`); // backend toggles enroll/unenroll
      toast.success('Withdrawn from event');
      fetchEvents();
    } catch (err) {
      toast.error('Error withdrawing from event');
    } finally {
      setEnrollingId(null);
    }
  };

  const isEnrolled = (event) => {
    return event.attendees?.some(a => a._id === user?._id || a === user?._id);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Events & Webinars</h1>
          <p className="text-gray-400">Connect, learn, and grow through our curated event list.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'alumni') && (
          <button className="btn-primary">
            <PlusCircle size={18} />
            Create Event
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 bg-white/5 p-1.5 rounded-xl border border-white/5 w-fit">
        {['all', 'placement-talk', 'workshop', 'conference', 'meetup'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`tab-btn ${filterType === type ? 'active' : ''} capitalize`}
          >
            {type.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 skeleton bg-[#1a2235]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
          {events.length > 0 ? events.map(event => (
            <div 
              key={event._id}
              className="glass rounded-2xl border border-[#1e2a40] overflow-hidden hover:border-[#a855f7]/30 transition-all group flex flex-col h-full min-w-0 break-words"
            >
              {/* Event Banner */}
              <div className="h-40 bg-gradient-to-br from-[#1e2a40] to-[#0b0f19] relative flex items-center justify-center border-b border-white/5">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center text-[#c084fc] border border-[#a855f7]/20 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <Calendar size={32} />
                </div>
                {event.isFeatured && (
                  <span className="absolute top-4 left-4 badge badge-warning text-[0.6rem] uppercase tracking-tighter">Featured</span>
                )}
                <span className="absolute top-4 right-4 badge badge-primary text-[0.6rem] uppercase tracking-tighter">{event.type}</span>
              </div>

              {/* Event Content */}
              <div className="p-6 space-y-4 flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-[#c084fc] transition-colors line-clamp-2">{event.title}</h3>
                
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                    <CalendarDays size={16} className="text-[#a855f7]" />
                    <span>{format(new Date(event.date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                    <Clock size={16} className="text-[#a855f7]" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                    <MapPin size={16} className="text-[#a855f7]" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users size={14} />
                    <span>{event.attendees?.length || 0} enrolled</span>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1a2235] bg-gray-800 flex items-center justify-center text-[0.5rem] font-bold text-white">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 pt-0 mt-auto">
                <div className="divider opacity-20 mb-4"></div>
                {isEnrolled(event) ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleWithdraw(event._id)}
                      disabled={enrollingId === event._id}
                      className="btn-danger flex-1 justify-center items-center h-11 text-xs"
                    >
                      Withdraw
                    </button>
                    <a 
                      href={event.link || '#'} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-primary flex-1 justify-center items-center h-11 text-xs box-border"
                    >
                      Join Now <ExternalLink size={14} />
                    </a>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleEnroll(event._id)}
                    disabled={enrollingId === event._id}
                    className="btn-primary w-full justify-center h-11 group-hover:shadow-[#a855f7]/20"
                  >
                    {enrollingId === event._id ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center glass rounded-2xl border border-dashed border-[#1e2a40]">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
              <p className="text-gray-500">Check back later for new workshops and talks.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
